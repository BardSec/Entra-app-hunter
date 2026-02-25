FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_DEBUG=true
ENV BACKEND_PORT=5000

EXPOSE ${BACKEND_PORT}

CMD flask run --host=0.0.0.0 --port=${BACKEND_PORT}
