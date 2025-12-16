from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import os

# ----- Download the model and tokenizer once -----
model_name = "vennify/t5-base-grammar-correction"
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # كدا طلعنا لفوق خطوة
save_dir= os.path.join(BASE_DIR, "models", "grammar")


if not os.path.exists(save_dir):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.save_pretrained(save_dir)

    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    model.save_pretrained(save_dir)

# ----- create pipeline   -----
pipe = pipeline(
    "text2text-generation",
    model=save_dir,
    device=-1,  # CPU
    max_length=256
)

# ----- Text correction function -----
def correct_text(text, chunk_size=120):

    # Dividing the text if it is long
    words = text.split()
    chunks = [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

    # Processing each chunk
    corrected_chunks = [pipe(chunk)[0]["generated_text"] for chunk in chunks]

    final_output = " ".join(corrected_chunks)
    

    return final_output

