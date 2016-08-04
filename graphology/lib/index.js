const uuid = require('node-uuid')
const db = require('./db')

/*
    createNode(label, properties)
    Returns a new Graph node (vertex). 
    Returns null if error.
    'label' must be of type string, and 'properties' an Object
    'id' property in properties will be ignored
*/
//console.log(matchLabel("debi", "debit/credit"))

function Node(label, data) {
    if (typeof label === 'string') {
        this.id = uuid.v4()
        this.type = label
        this.in = []
        this.out = []
        this.data = data
    } else {
        const obj = label === Object(label) ? label : null
        if (obj === null) return null
        Object.assign(this, obj)
    }
    db.create(this)
}

Node.prototype.objectify = function() {
    return {
        id: this.id,
        type: this.type,
        data: this.data,
        in : this.in,
        out: this.out
    }
}

Node.prototype.addEdge = function(label, node, props) {
    if (typeof label !== 'string') return null
    this.out.push({ type: label, out: node.id, data: props })
    node.in.push({ type: label, in : this.id, data: props })
    db.update(this)
    db.update(node)
    return node
}

Node.prototype.updateProps = function(props) {
    if (typeof label !== 'string') return null
    this.data = props;
    db.update(this)
    return node
}

function Query(node) {
    this.f = function(next) {
        return next(node)
    }
}

Query.prototype.next = function() {
    return this.f(x => x)
}

Query.prototype.value = function(key) {

    const __next = this.f
    var prev = null
    this.f = function(next) {
        const value = __next(node => {
            if (node === prev) return null
            if (node === null) return null
            prev = node
            return node.data[key]
        })
        return next(value)
    }
    return this

}



function matchLabel(type, label) {

    if (label instanceof RegExp) {

        var inlabel = type.match(label)
        if (inlabel === null) {
            return false;
        }
        return true;
    }
    if (typeof label === "string") {
        if (type === label)
            return true

        return false
    }
    return false;

}


Query.prototype.out = function(label) {
    const __next = this.f
    var state = -1
    var node = null
    this.f = function(next) {
        if (node !== null) {
            var nextVal = next(node)
            if (nextVal !== null) return nextVal
        }
        node = __next(n => {
            var id = null
            for (var i = state + 1; i < n.out.length; i++) {
                if (matchLabel(n.out[i].type, label)) {
                    state = i
                    id = n.out[i].out
                    break
                }
            }
            if (id === null) {
                state = -1
                return null
            }
            return db.read(id)
        })
        if (node === null) return null
        return next(node)
    }
    return this
}

Query.prototype.in = function(label) {
    const __next = this.f
    var state = -1
    var node = null
    this.f = function(next) {
        if (node !== null) {
            var nextVal = next(node)
            if (nextVal !== null) return nextVal
        }
        node = __next(n => {
            var id = null
            for (var i = state + 1; i < n.in.length; i++) {
                if (matchLabel(n.in[i].type, label)) {
                    state = i
                    id = n.in[i].in
                    break
                }
            }
            if (id === null) {
                state = -1
                return null
            }
            return db.read(id)
        })
        if (node === null) return null
        return next(node)
    }
    return this
}

module.exports = {
    Node: Node,
    Query: Query,
    find: db.find,
    save: db.save,
    load: db.load,
    dump: db.dump,
    matchLabel: matchLabel,
    read: db.read
}
