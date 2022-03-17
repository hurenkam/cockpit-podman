import cockpit from "cockpit";

const PODMAN_SYSTEM_ADDRESS = "/run/podman/podman.sock";
export const VERSION = "/v1.12/";

export class Connection {
    constructor(address, system) {
        /* This doesn't create a channel until a request */
        this.#http = cockpit.http(address, { superuser: system ? "require" : null });
    }
    
    monitor(options, callback, return_raw) {
            return new Promise((resolve, reject) => {
                this.#http.request(options)
                        .stream(data => {
                            if (return_raw)
                                callback(data);
                            else
                                callback(JSON.parse(data));
                        })
                        .catch((error, content) => {
                            manage_error(reject, error, content);
                        })
                        .then(resolve);
            });
        };
    
    call(options) {
            return new Promise((resolve, reject) => {
                options = options || {};
                this.#http.request(options)
                        .then(resolve)
                        .catch((error, content) => {
                            manage_error(reject, error, content);
                        });
            });
        };
    
    close() {
        this.#http.close();
    };
}

export class PodmanApi {
    #system = false;
    constructor(system) {
        this.#system = system;
    }

    /*
    * Connects to the podman service, performs a single call, and closes the
    * connection.
    */
    async #call (address, system, parameters) {
        const connection = connect(address, system);
        const result = await connection.call(parameters);
        connection.close();
        return result;
    }

    #getAddress() {
        if (this.#system)
            return PODMAN_SYSTEM_ADDRESS;
        const xrd = sessionStorage.getItem('XDG_RUNTIME_DIR');
        if (xrd)
            return (xrd + "/podman/podman.sock");
        console.warn("$XDG_RUNTIME_DIR is not present. Cannot use user service.");
        return "";
    }

    #callApi(name, method, args, body) {
        const options = {
            method: method,
            path: VERSION + name,
            body: body || "",
            params: args,
        };
        console.log("PodmanApi.jsx@PodmanApi.callApi() " + JSON.stringify(options));
        return this.call(this.#getAddress(), this.#system, options);
    }

    downloadImage() {}
    getImages() {}

    createPod(config) {
        return new Promise((resolve, reject) => {
            this.#callApi("libpod/pods/create", "POST", {}, JSON.stringify(config))
                    .then(reply => resolve(JSON.parse(reply)))
                    .catch(reject);
        });
    }

    getPods(id) {
        return new Promise((resolve, reject) => {
            const options = {};
            if (id)
                options.filters = JSON.stringify({ id: [id] });
            this.#callApi("libpod/pods/json", "GET", options)
                    .then(reply => resolve(JSON.parse(reply)))
                    .catch(reject);
        });
    }

    createNetwork() {}
    getNetworks() {}

    createVolume() {}
    getVolumes() {}
}
