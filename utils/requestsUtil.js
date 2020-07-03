const printRequestInfo = req => {
  console.log('Request params: ');
  console.log(req.params);
  console.log(`Request Url: ${req.url}`);
  console.log(`Request Remote IP: `);
  console.log(req.ip);
  console.log(`Request Headers: `);
  console.log(req.headers);
  console.log(`Request Body: `);
  console.log(req.body);
  console.log(`Request Body Type: `);
  console.log(typeof req.body);
};

module.exports = printRequestInfo;
