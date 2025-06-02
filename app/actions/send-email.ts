"use server"

import transporter from "@/lib/mail"

export async function sendEmail({
  to,
  subject,
  meta,
}: {
  to: string,
  subject: string,
  meta: {
    link: string,
  }
}) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: `${subject} - ${process.env.APP_NAME}`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&amp;display=swap"
      rel="stylesheet" />
  </head>
  <body
    style="background-color:#f0f0f1;font-family:Outfit, Arial, sans-serif;margin:0;padding:80px 0">
    <!--$-->
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
      Verify your ResQr account
      <div>
         ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
      </div>
    </div>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width:480px;background-color:#ffffff;border-radius:12px;margin:0 auto;padding:48px;text-align:center">
      <tbody>
        <tr style="width:100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin-bottom:48px">
              <tbody>
                <tr>
                  <td>
                    <h1
                      style="color:#52525b;font-family:Outfit, Arial, sans-serif;font-size:24px;font-weight:600;margin:0;letter-spacing:-0.01em">
                      ResQr
                    </h1>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin-bottom:48px">
              <tbody>
                <tr>
                  <td>
                    <h1
                      style="color:#52525b;font-family:Outfit, Arial, sans-serif;font-size:20px;font-weight:500;margin:0 0 24px 0;letter-spacing:-0.01em">
                      Verify your email
                    </h1>
                    <p
                      style="font-size:15px;line-height:1.6;color:#71717a;font-family:Outfit, Arial, sans-serif;font-weight:400;margin:0 0 32px 0;margin-bottom:32px;margin-top:0;margin-left:0;margin-right:0">
                      Click the button below to verify your email address and
                      activate your ResQr account.
                    </p>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="margin-bottom:32px">
                      <tbody>
                        <tr>
                          <td>
                            <a
                              href=${meta.link}
                              style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;background-color:#ea580c;color:#ffffff;font-family:Outfit, Arial, sans-serif;font-size:15px;font-weight:500;border-radius:8px;padding:14px 24px 14px 24px;border:none;box-sizing:border-box"
                              target="_blank"
                              ><span
                                ><!--[if mso]><i style="mso-font-width:400%;mso-text-raise:21" hidden>&#8202;&#8202;&#8202;</i><![endif]--></span
                              ><span
                                style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px"
                                >Verify email</span
                              ><span
                                ><!--[if mso]><i style="mso-font-width:400%" hidden>&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span
                              ></a
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p
                      style="font-size:13px;line-height:1.5;color:#71717a;font-family:Outfit, Arial, sans-serif;font-weight:400;margin:0 0 24px 0;margin-bottom:24px;margin-top:0;margin-left:0;margin-right:0">
                      This link expires in
                      <!-- -->24 hours<!-- -->.
                    </p>
                    <p
                      style="font-size:13px;line-height:1.5;color:#71717a;font-family:Outfit, Arial, sans-serif;font-weight:400;margin:0;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0">
                      If you didn&#x27;t create this account, you can ignore
                      this email.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="border-top:1px solid #e4e4e7;padding-top:24px">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:12px;line-height:24px;color:#71717a;font-family:Outfit, Arial, sans-serif;font-weight:400;margin:0;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0">
                      ResQr •<a
                        href="mailto:support@resqr.com"
                        style="color:#71717a;text-decoration-line:none;font-family:Outfit, Arial, sans-serif;text-decoration:none"
                        target="_blank"
                        >Support</a
                      >•<a
                        href="#"
                        style="color:#71717a;text-decoration-line:none;font-family:Outfit, Arial, sans-serif;text-decoration:none"
                        target="_blank"
                        >Unsubscribe</a
                      >
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--7--><!--/$-->
  </body>
</html>

`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email", error);
    return { success: false };
  }
}
