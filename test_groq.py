import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

try:

    response = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "user",
                "content": "Hello. Reply with a short greeting."
            }
        ],

        temperature=0.2,
        max_tokens=100
    )

    print("\nSUCCESS!")
    print(response.choices[0].message.content)

except Exception as e:

    print("\nERROR:")
    print(type(e))
    print(repr(e))