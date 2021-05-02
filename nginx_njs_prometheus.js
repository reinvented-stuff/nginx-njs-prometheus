/*

    Nginx njs application that mimics a prometheus exporter.
    
*/

var VERSION = "0.0.0";

function index(req) {

    var result = "";

    result += `# HELP Currently open connections\n`;
    result += `# TYPE gauge\n`;
    result += `nginx_current_active{instance="${req.variables.hostname}"} ${req.variables.connections_active}\n`;

    result += `# HELP Number of request nginx is reading headers from\n`;
    result += `# TYPE gauge\n`;
    result += `nginx_current_reading{instance="${req.variables.hostname}"} ${req.variables.connections_reading}\n`;

    result += `# HELP Number of request body readings, request processings, or response writings\n`;
    result += `# TYPE gauge\n`;
    result += `nginx_current_writing{instance="${req.variables.hostname}"} ${req.variables.connections_writing}\n`;

    result += `# HELP Number of connections that are Keep-Alive'ing\n`;
    result += `# TYPE gauge\n`;
    result += `nginx_current_waiting{instance="${req.variables.hostname}"} ${req.variables.connections_waiting}\n`;

    req.subrequest('/nginx_stats/', { method: 'GET' }, function(res) {

        if (res.status != 200) {
            req.return(res.status);
            return;
        }

        var response_lines = res.responseBody.split("\n");
        var counters = response_lines[2].split(" ");

        result += `# HELP Total accepted connectons\n`;
        result += `# TYPE counter\n`;
        result += `nginx_accepted_connectons{instance="${req.variables.hostname}"} ${counters[1]}\n`;

        result += `# HELP Total handled connections\n`;
        result += `# TYPE counter\n`;
        result += `nginx_handled_connections{instance="${req.variables.hostname}"} ${counters[2]}\n`;

        result += `# HELP Total handled requests\n`;
        result += `# TYPE counter\n`;
        result += `nginx_handled_requests{instance="${req.variables.hostname}"} ${counters[3]}\n`;

        req.return(200, result);

    });
}

export default {index};
