from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.apps import apps_bp
from routes.dashboard import dashboard_bp
from routes.compliance import compliance_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(apps_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(compliance_bp, url_prefix="/api")

    @app.errorhandler(PermissionError)
    def handle_permission_error(e):
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "mockMode": Config.MOCK_MODE,
            "authMode": Config.AUTH_MODE,
        })

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(debug=Config.FLASK_DEBUG, host="0.0.0.0", port=5000)
