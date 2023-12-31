const router = require("express").Router();
const multer = require('multer');
const path = require('path');
const {v4:uuid4} = require('uuid');

const File = require('../models/file');


 
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/') ,
  filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName)
  } ,
});
let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb

  router.post('/', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
      });
});


router.post('/send', async(req,res)=>{
  const { uuid, emailTo, emailFrom } = req.body;
  if(!(uuid || emailTo || emailFrom)){
    return res.status(400).send({ error: 'All fileds are required....'});
  }

  const result = await File.findOne({ uuid: uuid});

  if(result.sender){
    return res.status(400).send({error: 'Email already sent..'})
  }

  result.sender = emailFrom;
  result.receiver= emailTo;
   
  const response = await result.save();
// send Mail

const sendMail = require('../services/emailService');
sendMail({
  from: emailFrom,
  to: emailTo,
  subject: "Ushare File Sharing",
  text: `${emailFrom}  shared a file with you.`,
  html: require('../services/emailTemplate')({emailFrom: emailFrom,
                                              downloadLink: `${process.env.APP_BASE_URL}/files/${result.uuid}`,
                                              size: parseInt(result.size/100) + 'KB',
                                            expires: '24 Hours'})
});

return res.send({sucess: true})


  
})




module.exports = router;