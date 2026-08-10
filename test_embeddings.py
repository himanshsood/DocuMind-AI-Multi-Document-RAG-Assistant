from app.services.embeddings import generate_embedding


text = "Employees receive 20 days of annual leave."

embedding = generate_embedding(text)


print("Embedding type:", type(embedding))
print("Number of dimensions:", len(embedding))
print("First 10 values:", embedding[:10])
