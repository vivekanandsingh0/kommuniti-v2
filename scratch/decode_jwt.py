import base64
import json

jwt_payload = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod2RwY2hrZ3V5dXJiZWZkZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjIyMzUsImV4cCI6MjA5MjY5ODIzNX0"
decoded = base64.b64decode(jwt_payload + "==").decode("utf-8")
print(decoded)
