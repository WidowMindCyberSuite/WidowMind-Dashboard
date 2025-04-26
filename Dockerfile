# WidowMind Dashboard Dockerfile
# Located at: /WidowMind/dashboard/Dockerfile

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy the dashboard app code into container
COPY app/ /app/

# Install required Python packages
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Expose port 5050
EXPOSE 5050

# Launch the Dashboard app using Gunicorn
CMD ["gunicorn", "dashboard_server:app", "--bind", "0.0.0.0:5050", "--workers", "2", "--threads", "2", "--timeout", "120"]
