export const transformTypescript = (jsonStr) => {

    const buildITypeItem = (name, type, require = true, children = []) => {
        return {
            name,
            type,
            require,
        };
    };

    const updateHash = (name, type, require) => {
        if (typeHash[name]) {
            const hash = typeHash[name];
            if (!hash.type.includes(type)) {
                hash.type.push(type);
            }
            hash.require = hash.require && require;

        }
    };
    const typeHash = {

    };


    const dep = (obj) => {
        let keys = Object.keys(obj);
        let typeObj = {};
        for (let key of keys) {
            switch (typeof obj[key]) {
                case 'string':
                case 'number':
                case 'boolean':
                    updateHash(key, typeof obj[key], true);
                    break;

                case 'object':

            }
        }
    };

    const updateObjHash = (obj) => {
        if (Array.isArray(obj)) {
            for (let item of obj) {

            }
        } else {

        }
    };



    if (typeof jsonStr !== 'string') {
        throw new Error();
    }
    const json = JSON.parse(jsonStr);




};



