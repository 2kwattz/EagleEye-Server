module.exports = function sqlInjectionGuard(req, res, next) {

    // SQL Injection Regex Patterns 

    const suspiciousPatterns = [
      // Looks for patterns like ' OR 1=1 --
      /('|\%27)\s*(or|and)\s+\d+=\d+/i,
  
      // Matches strings like ' OR 'a'='a
      /('|\%27)\s*(or|and)\s*('|\%27)[^=]*=\3/i,
  
      // UNION SELECT
      /union(\s)+select/i,
  
      // SELECT ... FROM
      /select.+from/i,
  
      // DROP TABLE
      /drop\s+table/i,
  
      // INSERT INTO
      /insert.+into/i,
  
      // DELETE FROM
      /delete\s+from/i,
  
      // UPDATE ... SET
      /update.+set/i,
  
      // EXEC SP_ (e.g. exec sp_help)
      /exec(\s|\+)+(s|x)p\w+/i
    ];
  
    const payload = JSON.stringify(req.body) + JSON.stringify(req.query) + req.originalUrl;
  
    if (suspiciousPatterns.some((regex) => regex.test(payload))) {

        console.warn('SQL Injection was detected and blocked ', payload);
   
        // Fetching Attacker's IP Address

        // const ip = req.ip;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        return res.status(403).json({ error: 'SQL Injection Was Detected And Blocked', ip: ip });
    }
  
    next();
  };
  