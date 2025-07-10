// IP Addresses blocked from using the web application due to security breaching attempts

const blockedIPs = ['http://localhost:3000'];

module.exports = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    if(blockedIPs.includes(clientIp)){
        // return res.status(403).send('Access denied, you shady onion.');
        return res.status(403).send("Access Denied. Please contact system administrator")
    }

    next()
}