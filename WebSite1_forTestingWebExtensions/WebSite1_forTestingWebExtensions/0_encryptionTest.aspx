<%@ Page Language="C#" AutoEventWireup="true" CodeFile="0_encryptionTest.aspx.cs" Inherits="_0_encryptionTest" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
	<script src="js/jquery-3.1.1.min.js"></script>
	<script src="js/hqicrc.js"></script>


	<script>
			var RC = {
				key: 'gate.keeper',
				crypt: function (text) {
					var key = this.key;
					return CryptoJS.RC4.encrypt(text, key);
				},

				descryp: function (text) {
					var key = this.key;
					var t = CryptoJS.RC4.decrypt(text, key);
					t = t.toString(CryptoJS.enc.Latin1);
					return t;
				}
			}

			function encryptClick() {
				alert('hello');
				var txt = $('#rcOrigin').html();
				alert($('#rcOrigin').html());
				alert(document.getElementById('rcOrigin').innerHTML);
				$('#rcEncrypted').html(RC.crypt(txt));
			}

			function decryptClick() {
				var txt = $('#rcEncrypted').html();
				$('#rcOrigin').html(RC.descryp(txt));
			}
	</script>


</head>
<body>
	<h1>For plugin encryption</h1>
	<div style="width:100px;display:inline-block">original: </div> <input id="rcOrigin" type="text" style="width:200px;"/><br />
	<div style="width:100px;display:inline-block">encripted: </div> <input id="rcEncrypted" type="text" style="width:200px;"/><br />
	<button type="button" onclick="encryptClick();">Encrypt</button>
	<button type="button" onclick="decryptClick();">Decrypt</button>
    <form id="form1" runat="server">
        <div>
        </div>
    </form>
</body>
</html>
