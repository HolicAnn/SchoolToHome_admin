const Core = require('@alicloud/pop-core')
const accessKeyId = 'LTAI4FhnbkSECCTe8gFqxKJ8'
const secretAccessKey = 'jZhcXH0iK6kY8oYcYrvUpZIUljEbAJ'
const moment = require('moment')
//重置密码模板SMS_180045543
//注册验证模板SMS_180055577
class sendSMS {
  constructor(phone, TemplateCode, signName = "言柒教育") {
    this.phone = phone;
    this.signName = signName;
    this.TemplateCode = TemplateCode;
  }
  async go() {
    let code = Number.parseInt(Math.random() * 1000000);
    var client = new Core({
      accessKeyId: accessKeyId,
      accessKeySecret: secretAccessKey,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    });
    var params = {
      "RegionId": "cn-hangzhou", //默认
      "PhoneNumbers": this.phone, //发送号码
      "SignName": this.signName, // 签名名称
      "TemplateCode": this.TemplateCode, //模板code
      "TemplateParam": "{\"code\":" + code + "}"
    }
    //console.log(params);
    var requestOption = {
      method: 'POST'
    };
    var SMSResult = null;
    try {
      let result = await client.request('SendSms', params, requestOption).then(result => {
        return result
      });
      SMSResult = {
        status: "success",
        result: result,
        codes: code,
        phonenumbers: this.phone,
        signnames: this.signName,
        templates: this.TemplateCode,
        created_time: moment(Number.parseInt(Date.now())).format("YYYY-MM-DD HH:mm"),
      }
    } catch (e) {
      SMSResult = {
        status: "error",
        result: {
          msg: e.name,
          //       error: e.name, //错误信息
        }
      };
    }
    return SMSResult;
  }
}
module.exports = sendSMS;