from app.services.vector_store import search_documents


query = "How many days of annual leave do employees get?"


results = search_documents(
    query=query,
    top_k=5
)


print("\nQuery:")
print(query)


print("\nResults:")

for index, result in enumerate(results, start=1):

    print("\n" + "=" * 80)

    print(f"Result #{index}")

    print("\nText:")
    print(result["text"])

    print("\nFilename:")
    print(result["filename"])

    print("\nPage:")
    print(result["page_number"])

    print("\nDistance:")
    print(result["distance"])
