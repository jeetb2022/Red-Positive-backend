const express = require('express');
const internData = require('./internModel');
var bodyParser = require('body-parser');
const nodemailer =require('nodemailer');
const cors = require("cors");
require('dotenv').config()
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
const jsonParser = express.json();
app.use(jsonParser);
app.post('/add',cors(), async (req,res)=>{
  internData.deleteOne({ _id : null}).exec();
  var myData = new internData({
    intern_name : req.body.intern_name,
    intern_email : req.body.intern_email,
    intern_phone : req.body.intern_phone,
    intern_hobbies : req.body.intern_hobbies
  });
  // console.log(myData);
  await myData.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      console.log(err);
      res.status(400).send("unable to save to database");
    });
})
app.post('/delete',cors(),(req,res)=>{
    // console.log(req.body);
    // res.send(req.body);
    internData.deleteMany({ _id: req.body}).exec();
   
})
app.post('/update',cors(),(req,res)=>{
    console.log(req.body);
    // res.send(req.body);
    internData.deleteOne({ _id: req.body._id}).exec();
    var myData = new internData({
      intern_name : req.body.intern_name,
      intern_email : req.body.intern_email,
      intern_phone : req.body.intern_phone,
      intern_hobbies : req.body.intern_hobbies
    });
    console.log(myData);
    myData.save()
      .then(item => {
        console.log(("item saved to database"));
      })
      .catch(err => {
        console.log(("item not saved to database"));
        // res.status(400).send("unable to save to database");
      });
      res.send(req.body);
})

app.post('/email',async(req,res)=>{
  const data = await internData.find().where('_id').in(req.body).exec();
  let transporter = await nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'jeetbhadaniya1228@gmail.com',
        pass: process.env.emailPass, // generated ethereal password
    },
    headers: {
        "x-priority": "1",
        "x-msmail-priority": "High",
        importance: "high"
    }
});

let htmlData = `
<h3>Here is the details selected</h3> 
<table>
<tr>
  <th>Id</th>
  <th>Name</th>
  <th>Phone Number</th>
  <th>Email</th>
  <th>Hobbies</th>
</tr>
<tbody>
`
data.forEach(function (item) {
    htmlData += `  
    <tr>
    <td>${item._id}</td>
    <td>${item.intern_name}</td>
    <td>${item.intern_phone}</td>
    <td>${item.intern_email}</td>
    <td>${item.intern_hobbies}</td>
  </tr>
  `
})

htmlData += `
</tbody>
</table>
`
// console.log(htmlData);

var mailOptions = {
    from: 'Jeet Bhadaniya <jeetbhadaniya1228@gmail.com>',
    to: 'tejaspansuriya46@gmail.com',
    subject: 'Details of Users',
    // html: ejs.renderFile(__dirname + '/index.ejs', { data: data })
    html: htmlData
    //     ejs: ' '
};
// 'info@redpositive.in'
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    }
    else {
        console.log("Email Sent");
        res.redirect("/refresh");
    }
})
})

app.get('/',(req,res)=>{
    internData.find({}).then((items)=>{res.json(items)}).catch((err)=>{console.log("error")})
})
app.listen(process.env.PORT||3001,()=>{
    console.log("Connected");
});