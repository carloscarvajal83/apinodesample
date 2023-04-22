const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const cors = require("cors");
require("dotenv").config();

// middleware
app.use(express.json({limit: '50mb'}));
app.use(cors());

const port = 3001;
app.listen(port, () => {
    const today = new Date();
    const time = today.getTime().toString();
    console.log(`Server is running on port: ${port} at time ${time}`);
});

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      pass: process.env.WORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: process.env.OAUTH_ACCESS_TOKEN,
    },
});

transporter.verify((err, success) => {
err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`);
});

const blobToBase64 = async (blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            resolve(null);
        }
    });
};


app.post("/sendemailapi", async function (req, res)
{
    const today = new Date();
    const time = today.getTime().toString();
    //console.log("req data:", req);
    let attachments = req.body.data.attachments;
    //console.log(attachments[0]);
    const mailAttachments = [];
    if (attachments && attachments.length > 0){
        mailAttachments.push({   // encoded string as an attachment
            filename: `DerechoPeticionNode_${time}.pdf`,
            path: attachments[0],
        });
    }
    
    let mailOptions = {
        from: process.env.EMAIL,
        to: `${req.body.data.to}`,
        subject: `${req.body.data.subject}` + time,
        text: `${req.body.data.body}`,
        attachments: mailAttachments,
    };

    //console.log("req data:", req?.body?.data);
    //console.log(attachments?.length > 0 ? (attachments[0].length) : null );

    /*return new Promise ((resolve) => {
        setTimeout(async ()=>{
            console.log("req data:", req?.body);
            resolve(res.json({
                status: "success",
            }));
        }, 2000);
    });*/
    
    transporter.sendMail(mailOptions, function (err, data)
    {
        if (err) {
            console.log("Error " + err);
            res.json({
                status: "Failed at sending email",
                error: err? err.toString() : "error"
            });
        } else {
            console.log("Email sent successfully");
            res.json({ status: "Email sent succesfully", data:data });
        }
    });
    
    //res.json({ status: "Email sent succesfully" });
});