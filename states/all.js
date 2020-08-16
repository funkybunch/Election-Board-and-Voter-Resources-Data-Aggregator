async function returnAllStates() {
    return {
        nc: await require('./NC.js').collect().then((response) => {
            return response;
        }),
    }
}

module.exports = {
    collect: async () => {
        return await returnAllStates();
    }
}