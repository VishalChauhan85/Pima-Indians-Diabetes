from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import pickle
import numpy as np

FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

_MODEL = None


def _load_model():
    global _MODEL
    if _MODEL is None:
        model_path = os.path.join(os.path.dirname(__file__), "pred.pkl")
        with open(model_path, "rb") as f:
            _MODEL = pickle.load(f)
    return _MODEL


def _cors(handler: BaseHTTPRequestHandler):
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        _cors(self)
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length else b"{}"
            payload = json.loads(raw or b"{}")

            missing = [f for f in FEATURES if f not in payload]
            if missing:
                return self._json(400, {"error": f"Missing fields: {missing}"})

            row = [float(payload[f]) for f in FEATURES]
            model = _load_model()
            X = np.array([row], dtype=float)

            pred = model.predict(X)[0]
            try:
                pred = int(pred)
            except Exception:
                pred = str(pred)

            proba = None
            if hasattr(model, "predict_proba"):
                p = model.predict_proba(X)[0]
                proba = float(p[1]) if len(p) > 1 else float(p[0])

            return self._json(200, {
                "prediction": pred,
                "label": "Diabetic" if pred == 1 else "Not Diabetic",
                "probability": proba,
                "features": dict(zip(FEATURES, row)),
            })
        except Exception as e:
            return self._json(500, {"error": str(e)})

    def _json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        _cors(self)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# --- RENDER SERVER LOOP ADDED BELOW ---
if __name__ == "__main__":
    # Render assigns a dynamic port via the PORT environment variable
    port = int(os.environ.get("PORT", 10000))
    server_address = ("0.0.0.0", port)
    
    print(f"Starting server on port {port}...")
    httpd = HTTPServer(server_address, handler)
    httpd.serve_forever()
