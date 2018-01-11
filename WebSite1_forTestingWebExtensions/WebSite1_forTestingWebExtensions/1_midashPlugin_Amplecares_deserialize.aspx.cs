using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _1_midashPlugin_Amplecares_deserialize : System.Web.UI.Page
{
	protected void Page_Load(object sender, EventArgs e)
	{
		signatureStatusDeserialize();
	}

	protected void signatureStatusDeserialize()
	{
		string s = "{ \"user\" : {    \"id\" : 12345, \"accepted?\": true, \"screen_name\" : \"twitpicuser\"}}";
		var serializer = new JavaScriptSerializer();
		var result = serializer.DeserializeObject(s);

		string s1 = "{ \"user\" : 123, \"accepted?\":true}";
		dynamic r = serializer.DeserializeObject(s1);
		Class1 rr = new Class1();
		rr.user= r["user"].ToString();
		rr.accepted = r["accepted?"];

		var jss = new JavaScriptSerializer();
		Class1 result1 = jss.Deserialize<Class1>(s1);
		int theend=1;
	}
}

public class Class1
{
	public string user { get; set; }
	public bool? accepted { get; set; }
}