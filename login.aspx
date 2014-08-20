<%@ Page Language="C#" %>

<%@ Import Namespace="System.Web.Security" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<script runat="server">
    public void Login_OnClick(object sender, EventArgs args)
    {
        if (FormsAuthentication.Authenticate(UsernameTextbox.Text, PasswordTextbox.Text))
            FormsAuthentication.RedirectFromLoginPage(UsernameTextbox.Text, NotPublicCheckBox.Checked);
        else
            Msg.Text = "Login failed. Please check your user name and password and try again.";
    }
</script>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Usergroup Raffle Login</title>

    <link href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" type="text/css" rel="stylesheet" />

    <style>
        body {
            padding-top: 40px;
            padding-bottom: 40px;
            /*background-color: #eee; */
        }

        .form-signin {
            max-width: 330px;
            padding: 15px;
            margin: 0 auto;
        }

            .form-signin .form-signin-heading,
            .form-signin .checkbox {
                margin-bottom: 10px;
            }

            .form-signin .checkbox {
                font-weight: normal;
            }

            .form-signin .form-control {
                position: relative;
                height: auto;
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                padding: 10px;
                font-size: 16px;
            }

                .form-signin .form-control:focus {
                    z-index: 2;
                }

            .form-signin input[type="email"] {
                margin-bottom: -1px;
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;
            }

            .form-signin input[type="password"] {
                margin-bottom: 10px;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
            }
    </style>

</head>
<body>
    <div class="container">
        <form id="form1" runat="server" class="form-signin">

            <h2 class="form-signin-heading">Please sign in</h2>

            <asp:Label ID="Msg" ForeColor="maroon" runat="server" /><br />

            Username:
                      <asp:TextBox ID="UsernameTextbox" runat="server" CssClass="form-control" /><br />

            Password:
                      <asp:TextBox ID="PasswordTextbox" runat="server" CssClass="form-control" TextMode="Password" /><br />

            <asp:Button ID="LoginButton" Text="Login" OnClick="Login_OnClick" runat="server" CssClass="btn btn-lg btn-primary btn-block" />

            <div class="checkbox">
                <label>
                    <asp:CheckBox ID="NotPublicCheckBox" runat="server" />
                    Check here if this is <span style="text-decoration: underline">not</span> a public computer.
                </label>
            </div>
        </form>
    </div>
</body>
</html>
