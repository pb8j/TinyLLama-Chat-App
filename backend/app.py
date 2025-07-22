from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch
import os

app = Flask(__name__)
CORS(app) # Enable CORS for your frontend to communicate

# --- Model Loading Configuration ---
base_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
# Ensure this path is correct relative to your app.py or is an absolute path
adapter_path = "./my-tinyllama-adapter"

# Global variables to hold model and tokenizer
model = None
tokenizer = None

def load_model_and_tokenizer():
    global model, tokenizer
    if model is None or tokenizer is None:
        print("Loading base model and tokenizer...")
        # Load base model
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            device_map="auto",  # This will use GPU if available, otherwise CPU
            torch_dtype=torch.float16 # Use float16 for efficiency, adjust if your GPU doesn't support it well
        )
        print("Base model loaded.")

        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(base_model_name)
        tokenizer.pad_token = tokenizer.eos_token
        # Ensure padding_side is set to "right" for generation if not already
        tokenizer.padding_side = "right"
        print("Tokenizer loaded.")

        # Check if adapter path exists
        if not os.path.exists(adapter_path):
            raise FileNotFoundError(f"Adapter path not found: {adapter_path}. Make sure 'my-tinyllama-adapter' directory exists and contains adapter_model.safetensors.")

        # Load LoRA adapter
        print(f"Loading LoRA adapter from {adapter_path}...")
        model = PeftModel.from_pretrained(base_model, adapter_path)
        print("LoRA adapter loaded.")
        model.eval() # Set model to evaluation mode
        print("Model set to evaluation mode.")
    return model, tokenizer

# Load model and tokenizer when the app starts
with app.app_context():
    try:
        model, tokenizer = load_model_and_tokenizer()
        print("Model and tokenizer successfully loaded on app startup.")
    except Exception as e:
        print(f"Error loading model on startup: {e}")
        # In a production environment, you might want to log this error and potentially exit
        # For development, we'll allow it to try loading on first request.

@app.route('/process-query', methods=['POST'])
def process_query_api():
    user_query = request.json.get('query')
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    print(f"Received query: {user_query}")

    # Ensure model and tokenizer are loaded (fallback if startup load failed)
    current_model, current_tokenizer = load_model_and_tokenizer()
    if current_model is None or current_tokenizer is None:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500

    try:
        # Format the prompt exactly as in your Colab code
        prompt = f"### Question:{user_query} \n### Answer:"
        inputs = current_tokenizer(prompt, return_tensors="pt").to(current_model.device)

        # Generate the response
        with torch.no_grad():
            outputs = current_model.generate(
                **inputs,
                max_new_tokens=200, # Increased max_new_tokens to allow for longer answers
                do_sample=False,    # Deterministic output (set True for variation)
                top_p=0.9,
                temperature=0.7,
                pad_token_id=current_tokenizer.eos_token_id
            )

        # Decode the full response, keeping special tokens initially to find </s>
        full_decoded_response = current_tokenizer.decode(outputs[0], skip_special_tokens=False)

        # The model's output will start with the prompt itself.
        # We need to find the actual generated part after the prompt.
        # Ensure we handle cases where the prompt might not be at the very beginning
        # (though it should be if `outputs[0]` is the direct generation).
        if full_decoded_response.startswith(prompt):
            generated_part_with_tokens = full_decoded_response[len(prompt):]
        else:
            # Fallback if the prompt isn't at the start (e.g., if the tokenizer adds bos token)
            # This is less likely with the current setup but good for robustness.
            answer_start_marker = "\n### Answer:"
            idx = full_decoded_response.find(answer_start_marker)
            if idx != -1:
                generated_part_with_tokens = full_decoded_response[idx + len(answer_start_marker):]
            else:
                generated_part_with_tokens = full_decoded_response


        # Define markers that indicate the end of a desired answer
        # These include the end-of-sequence token </s> and the start of a new question format
        end_markers = ["</s>", "### Question:"]
        first_end_idx = len(generated_part_with_tokens) # Default to full length

        for marker in end_markers:
            idx = generated_part_with_tokens.find(marker)
            if idx != -1 and idx < first_end_idx:
                first_end_idx = idx

        # Extract the answer part before any of the end markers
        extracted_answer = generated_part_with_tokens[:first_end_idx].strip()

        # Final cleanup: remove any remaining special tokens if skip_special_tokens=False was used
        # and they weren't caught by the end_markers (e.g., if </s> was not generated)
        generated_text = extracted_answer.replace(current_tokenizer.eos_token, "").strip()


        return jsonify({"response": generated_text})
    except Exception as e:
        print(f"Error during model inference: {e}")
        return jsonify({"error": "Failed to generate response from model."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)