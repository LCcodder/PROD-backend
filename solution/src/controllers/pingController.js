class PingController {
    async ping(_req, res) {
        return res.status(200).send("ok")
    } 
}

module.exports = {PingController}