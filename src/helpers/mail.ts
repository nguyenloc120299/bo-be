import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "cryptopluspress@gmail.com",
    pass: "qwat wvav sztk yunr",
  },
});

export const sendMailOTP = async (user: any, title: string, otp: string) => {
  const mainOptions = {
    from: "Crypto Plus",
    to:user?.email,
    subject: title,
    html: `
    <div
    style="
      margin: 0;
      padding: 0;
      background-color: #e7edf3;
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 15px;
      color: #183c4c;
      font-weight: 400;
    "
  >
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="600"
      style="border-collapse: collapse; background-color: #ffffff"
    >
      <tbody>
        <tr>
          <td
            colspan="2"
            align="center"
            style="
              padding-top: 35px;
              padding-bottom: 15px;
              padding-left: 10px;
              padding-right: 10px;
            "
          >
            <img
              src="https://cryptoplus.press/images/logo.png"
              style="height: 47px"
              class="CToWUd"
              data-bit="iit"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2" align="center">
            <div
              style="
                padding-left: 10px;
                padding-right: 10px;
                padding-top: 15px;
                padding-bottom: 0px;
                color: #13171c;
                margin-top: 5px;
                border-radius: 8px 8px 0 0;
                font-family: 'Ubuntu';
              "
            >
              <div
                style="
                  padding-bottom: 18px;
                  font-size: 26px;
                  font-weight: bold;
                "
              >
                ${title}
                <span
                  style="
                    display: block;
                    overflow: hidden;
                    width: 114px;
                    height: 16px;
                    border-radius: 5px;
                    background-image: url(https://ci3.googleusercontent.com/meips/ADKq_Nb73cz7HhdUTVkHAPhOuKN_UNv_Q1luI2XQyQQP4NRZrV11H8yodbliNNT8J2mJ2Ih9L1dLoSZCTMmJIe8CWlQp=s0-d-e1-ft#https://bizkub.azureedge.net/email-line.png);
                    background-repeat: no-repeat;
                    margin-top: 15px;
                  "
                ></span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div
              style="
                padding-top: 0px;
                padding-bottom: 20px;
                padding-left: 30px;
                padding-right: 30px;
                color: #595c5f;
              "
            >
              <table
                align="center"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="border-collapse: collapse"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        padding-top: 5px;
                        padding-bottom: 15px;
                        font-size: 20px;
                        color: #13171c;
                      "
                    >
                      Dear <b>${user?.user_name}</b>,
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 5px; padding-bottom: 5px">
                    Dưới đây là mã xác minh của bạn. Vui lòng không tiết lộ mã này cho bất  kì ai
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 5px; padding-bottom: 5px">
                      <span style="font-weight: bold">${otp}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 5px; padding-bottom: 5px">
                      Nếu đây không phải là bạn vui lòng gửi thông tin cho chúng tôi theo địa chỉ
                      <a
                        href="mailto:cryptoplusPress@gmail.com"
                        style="text-decoration: none; color: #ee4b60"
                        target="_blank"
                        >cryptoplusPress@gmail.com
                        </a
                      >
                      để báo cáo sự việc này  
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 25px; padding-bottom: 5px">
                    Trân trọng,  
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 5px; padding-bottom: 5px">
                      <span>Crypto Plus </span> Team
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td
            colspan="2"
            align="center"
            style="font-weight: normal; color: #13171c; font-size: 15px"
          >
            <div style="border-top: 1.5px solid #cfdce8; width: 30%"></div>
            <div style="padding: 28px 0px">
              <span style="text-align: center"
                >Copyright © 2024 Crypto Plus. All Rights Reserved.</span
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <img
      src="https://ci3.googleusercontent.com/meips/ADKq_NZSHUIhyuwcPDwK6NOz92DCBrLWxYfHC9m2V8SMg6uqK0xda6PxUfCaekV2lxppIuGrtj23R2K_M5SaCKI1n6jOosJxY0w2lbzrL288lb79ZY9_ZrXp7KNpuzDkmbaOiId_awqahslkzuT0t2XdNcDZNajVU1tMHtJY8PWClCp5YgMfZmACN-mQpY7DnWRI3fM5cZQvEIO7H27XPgmLIhup-NQpd3OzTHHyPZ2AesXutEXLYy3R-hNToQD6ZgJ6p6t5QxjFe29ZItcLAh_b1RsxIz67ZkxW116mMHo10fsLtjmwzN1kvhiBuRYpWGtezdjAKUnSwkT-yXWg2e9NDJZpV6rMpcpw6Zp-4ISf-JmaM9nXaXPLghLDDuG9oj5dP1GQb0TQgLp340Wf6aJV3qSp3yxWw3yAFb6nFm5bzaz3OdUGQNwRtQ4=s0-d-e1-ft#https://u39322033.ct.sendgrid.net/wf/open?upn=u001.CP7s51D8KdwrtdVATT4IwSXIvubU3Wp1-2BMkB2V-2FCuEsf3e5kzi9beCbNKnN3XnBR9JCbVueZKycKxXjDQVqMez7hOzaedREVn0OK0bvly98wuBHpyYTpzlqiV-2BzPW6nglnDKypL9dc0d8lgSATCS-2F6S5JgSzPHX-2B3wj-2FjFjv0b9NecCYQAGM2zh6XsGh5lOCPEAKaurgB-2Bm5PBVPpDfhkERwm80CsmnhJ9-2FFY4UUK68-3D"
      alt=""
      width="1"
      height="1"
      border="0"
      style="
        height: 1px !important;
        width: 1px !important;
        border-width: 0 !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        padding-right: 0 !important;
        padding-left: 0 !important;
      "
      class="CToWUd"
      data-bit="iit"
    />
  </div>
      `,
  };
  transporter.sendMail(mainOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Message sent: " + info.response);
    }
  });
};
