# nginx-njs-prometheus

Nginx stub_status as an exporter for Prometheus

# Dependencies

1. nginx
2. ngx_http_js_module (http://nginx.org/en/docs/njs/index.html)
3. ngx_http_stub_status_module (http://nginx.org/en/docs/http/ngx_http_stub_status_module.html)

# Nginx configuration

## Install njs module

Follow the official documentation:
http://nginx.org/en/docs/njs/install.html

### Option 1: Check njs dynamic module loaded

In nginx.conf:
```nginx
load_module modules/ngx_http_js_module.so;
```

### Option 2: Check njs module is built-in

In shell:
```bash
nginx -V 2>&1 | grep njs
```

## Import njs application

In nginx.conf:
```nginx
http {

    ...

    js_import /etc/nginx/nginx_njs_prometheus/nginx_njs_prometheus.js;

}
```

Refer to the official docs for more information: 
http://nginx.org/en/docs/http/ngx_http_js_module.html#js_import

## Configure VirtualHost

```nginx
http {

    ...

    server {
        listen       80 default_server;
        server_name  localhost _;

        access_log  /var/log/nginx/access.json.log main;
        error_log  /var/log/nginx/error.log info;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        location /nginx_stats {
            stub_status;
        }

        location /metrics {
            js_content nginx_njs_prometheus.index;
            add_header Content-Type text/plain;
        }


    }

}
```

## Check configuration

```
sudo nginx -t
```

# Metrics example

```bash
# HELP Currently open connections
# TYPE gauge
nginx_current_active{instance="hostname.example.com"} 5
# HELP Number of request nginx is reading headers from
# TYPE gauge
nginx_current_reading{instance="hostname.example.com"} 0
# HELP Number of request body readings, request processings, or response writings
# TYPE gauge
nginx_current_writing{instance="hostname.example.com"} 1
# HELP Number of connections that are Keep-Alive'ing
# TYPE gauge
nginx_current_waiting{instance="hostname.example.com"} 0
# HELP Total accepted connectons
# TYPE counter
nginx_accepted_connectons{instance="hostname.example.com"} 729658
# HELP Total handled connections
# TYPE counter
nginx_handled_connections{instance="hostname.example.com"} 729658
# HELP Total handled requests
# TYPE counter
nginx_handled_requests{instance="hostname.example.com"} 398198
```

# Prometheus Scraper configuration

In prometheus.yml:

```yaml
global:
  scrape_interval:     30s

scrape_configs:
  - job_name: 'nginx-status'
    static_configs:
      - targets:
          - '127.0.0.1'
        labels:
          hostname: 'hostname.example.com'
          service: 'nginx'
      - targets:
          - '313.29.260.21'
        labels:
          hostname: 'reachable.example.com'
          service: 'nginx'

```

# Grafana dashboard

Here is an example of [Grafana Dashboard](nginx_njs_prometheus_dashboard.json)

![Alt text](/docs/grafana_example_1.png?raw=true "Grafana example")
