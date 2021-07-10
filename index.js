const path = require('path');


class Scanner {

    constructor() {
        this.routes = new Set();
        this.routesMethod = [];
        this.routesMethodsArrayFormat = [];
        this.routesMethodsObjectFormat = [];
    }

    createNewList() {
        this.routes = new Set();
        this.routesMethod = [];
        this.routesMethodsArrayFormat = [];
        this.routesMethodsObjectFormat = [];
    }


    addToLists(fullPath, layer, appendSlash) {
        if (appendSlash)
            fullPath += "/"

        this.routes.add(fullPath);


        let method = layer.route.methods
        let keys = Object.keys(method).filter(k => method[k])
        this.routesMethod.push([fullPath, keys[0]]);


        let index = this.routesMethodsArrayFormat.findIndex(x => x[0] === fullPath);
        if (index === -1)
            this.routesMethodsArrayFormat.push([fullPath, [keys[0]]])
        else
            this.routesMethodsArrayFormat[index][1].push(keys[0])

        index = this.routesMethodsObjectFormat.findIndex(x => x.url === fullPath)
        if (index === -1)
            this.routesMethodsObjectFormat.push({url: fullPath, methods: [keys[0]]})
        else
            this.routesMethodsObjectFormat[index]["methods"].push(keys[0])
    }

    layerScanner(layerList, fullRoute = "", appendSlash = false) {

        for (let layer of layerList) {
            if (layer.name === 'bound dispatch') {
                let regex = new RegExp('\\^\\\\\(\/.+?)\\\\\\/');
                let fullPath = path.join(fullRoute, layer.regexp.toString().match(regex)[1]).replace(/\\/g, '/')

                this.addToLists(fullPath, layer, appendSlash);

            } else if (layer.name === 'router') {
                let regex = new RegExp('\\^\\\\\(\/.+?)\\\\\\/');
                let routePath = path.join(fullRoute, layer.regexp.toString().match(regex)[1]).replace(/\\/g, '/')
                this.layerScanner(layer.handle.stack, routePath);
            }
        }
    }

    scan(appOrRouter) {
        this.createNewList();
        if (appOrRouter.stack) {
            this.layerScanner(appOrRouter.stack);
        } else if (appOrRouter._router.stack) {
            this.layerScanner(appOrRouter._router.stack);
        }
        return this
    }

    get routesList() {
        return [...this.routes]
    }

}

module.exports = function () {
    return new Scanner();
}