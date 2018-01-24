var idSignature='reamPhysSignature';//the canvas
var btnClicked = "";
var missedSignature = false;//true when form is validated, but missing signature
var dataFromHostPage = {
    //--from QBE
    patient: null,
    clinic: null,
    provider: null,
    //--from API
    licenseProducer: null,
    patFromApi: null,
    physFromApi:null
}
var formCommandType={
    create:'create',
    update:'update',
    unchange:''
}
var formCommand = {
    patient: null,
    physcisian: null,
    signature:formCommandType.create  //for collecting when created and change
}

var  numberLoadFinished= 0 //count load patient, physician, clinic, licence producer (when ==4 done)
//----init --------------------------------------------------
function initForm() {
    $('#reamPhysSigDate').html((new Date()).toDateString());

    $('#reamBtnPrint').click(function () {
        var physName = $('#reamPhysTitle').val() +' '+ $('#reamPhysFirstName').val()+' ' + $('#reamPhysLastName').val();
        $('#reamPrintPhysName').html(physName);
        //window.print();
        btnClicked = 'print';
    });

    $('#reamBtnSubmit').click(function () {
        btnClicked = 'submit';
    });
    $('#reamBtnCancel').click(function () {
        form_clearAll();
        messageToParent('cancelForm', {});

    });

    $('#reamPhysEdit').click(function () {
        form_blockPhysician(false);
        formCommand.physcisian = formCommandType.update;
    });

    $('#reamPatEdit').click(function () {
        form_blockClient(false);
        formCommand.patient = formCommandType.update;
    });

    $('#reamSignatureEdit').click(function () {
        form_blockSignature(false);
        formCommand.physcisian = formCommandType.update;
        formCommand.signature = formCommandType.update;  //bcause there is case change phys infor only, not signature, used in collecting form
    });
}

function initSignature(id,drawColor) {
    var mouseDown = false;
    var preX = null;
    var preY = null;

    function getMouseCanvas(canvas, evt) {//canvas is element
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
        //return {
        //    x: evt.clientX ,
        //    y: evt.clientY 
        //};
    }
    function mySigDrawAt(x, y) {
        var ele = document.getElementById(id);
        var ctx = ele.getContext('2d');
        if (preX!=null && preY!=null) {
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 1;
            ctx.moveTo(preX, preY);
            ctx.lineTo(x, y);
        }
        else {
            ctx.fillStyle = drawColor;
            ctx.fillRect(x, y, 3, 3);
        }
        preX = x;
        preY = y;

        ctx.stroke();
    }
    function resetSubmits() {
        if (missedSignature == true) {
            missedSignature = false;
            //enable submit buttons
            document.getElementById('reamBtnSubmit').removeAttribute('disabled');
            document.getElementById('reamBtnPrint').removeAttribute('disabled');
        }
               
    }

    $('#' + id + 'Erase').click(function () {
        initSignature_erase(id);
    });

    $('#'+id).mousedown(function () {
        mouseDown = true;
        resetSubmits();

    });
    $('#'+id).mouseup(function () {
        mouseDown = false;
        preX = null; preY = null;
    });
    $('#'+id).mouseout(function () {
        mouseDown = false;
        preX = null; preY = null;
    });

    $('#'+id).mousemove(function (e) {
        var xy = getMouseCanvas(document.getElementById(id), e);

        $('#xy').html(xy.x + ',' + xy.y);

        if (mouseDown == true) {
            //mySigDrawAt(e.pageX, e.pageY);
            mySigDrawAt(xy.x, xy.y);
        }
    });


}

function initSignature_erase(idCanvas) {
    var canvas = document.getElementById(idCanvas);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.beginPath();
}

//---validator----------------------------------------------
function formValidate_init() {

    var validator = $('#reamForm').bootstrapValidator({
        feedbackIcons: {
            valid: "glyphicon glyphicon-ok",
            invalid: "glyphicon glyphicon-remove",
            validating: "glyphicon glyphicon-refresh"
        },

        fields: {
            //----patient ----------------------------
            reamEmail: {
                message: "Email address is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an email address"
                    },
                    stringLength: {
                        min: 6,
                        max: 100,
                        message: "Email address must be between 6 and 100 characters long"
                    },
                    emailAddress: {
                        message: "Email address was invalid"
                    }
                }

            },
            reamFirstName: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamFirstName','reamLastName'];
                    var patAddrGroup = ['reamLastName'];
                    groupValidate(patAddrGroup);


                },
                message: "Patient's first name is required",
                validators: {


                    notEmpty: {
                        message: "Please provide an patient's first name"
                    },
                    stringLength: {
                        min: 1,
                        message: "First name must be at least 1 character long"
                    }
                }

            },
            reamLastName: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamFirstName','reamLastName'];
                    var patAddrGroup = ['reamFirstName'];
                    groupValidate(patAddrGroup);


                },
                message: "Patient's last name is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an patient's last name"
                    },
                    stringLength: {
                        min: 1,
                        message: "Last name must be at least 1 character long"
                    }
                }

            },
            reamDob: {
                message: "Patient's DOB is not valid",

                validators: {
                    notEmpty: {
                        message: 'Patient\'s DOB is required'
                    },
                    date: {
                        format: 'YYYY-MM-DD',
                        separator: '-'
                    }
                }
            },
            reamPatAddress: {
                trigger: 'change keyup',

                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal'];
                    var patAddrGroup = ['reamPatCity', 'reamPatProvince', 'reamPatPostal'];
                    groupValidate(patAddrGroup);


                },


                validators: {
                    notEmpty: {
                        message: "Please provide the patient's address"
                    },
                    stringLength: {
                        min: 4,
                        message: "Address must be at least 4 character long"
                    }
                }
            },
            reamPatCity: {
                trigger: 'change keyup',

                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal'];
                    var patAddrGroup = ['reamPatAddress', 'reamPatProvince', 'reamPatPostal'];
                    groupValidate(patAddrGroup);


                },

                validators: {
                    notEmpty: {
                        message: "Please provide the patient's city"
                    },
                    stringLength: {
                        min: 2,
                        message: "City must be at least 2 character long"
                    }
                }
            },
            reamPatProvince: {
                trigger: 'change keyup',

                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal'];
                    var patAddrGroup = ['reamPatAddress', 'reamPatCity', 'reamPatPostal'];
                    groupValidate(patAddrGroup);


                },

                message: "Province is required",
                validators: {
                    stringLength: {
                        min: 2,
                        message: "Choose a province!"
                    }
                }

            },
            reamPatPostal: {
                trigger: 'change keyup',

                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal'];
                    var patAddrGroup = ['reamPatAddress', 'reamPatCity', 'reamPatProvince'];
                    groupValidate(patAddrGroup);


                },


                message: "Postal Code is required",
                validators: {
                    notEmpty: {
                        message: "Please provide the patient's postal code"
                    },
                    zipCode: {
                        country: 'CA',
                        message: 'The value is not Canada valid postal code'
                    }
                }

            },
            //---medication--------------------------------
            reamMedGram: {
                validators: {
                    notEmpty: {
                        message: "Please provide number of gram"
                    },

                    numeric: {
                        message: 'Must be a number'
                    },

                    greaterThan: {
                        value: 0,
                        inclusive: false,
                        message: 'The value must be greater than 0.00'
                    }

                }
            },

            reamMedScriptStart: {
                message: "Start date is not valid",

                validators: {
                    notEmpty: {
                        message: 'Start date is required'
                    },
                    date: {
                        max: 'reamMedScriptEnd',
                        format: 'YYYY-MM-DD',
                        separator: '-'
                    }
                }
            },

            reamMedScriptEnd: {
                message: "End date is not valid",
                validators: {
                    notEmpty: {
                        message: 'End date is required'
                    },
                    date: {
                        min: 'reamMedScriptStart',
                        format: 'YYYY-MM-DD',
                        separator: '-'
                    }
                }
            },

            reamMedSelectLp: {
                validators: {
                    greaterThan: {
                        value: 1,
                        message: "License Provider is required"
                    }
                }
            },

            //---physician-------------
            reamPhysFirstName: {
                trigger: 'change keyup',

                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysFirstName','reamPhysLastName'];
                    var patAddrGroup = ['reamPhysLastName'];
                    groupValidate(patAddrGroup);


                },
                message: "Physician's first name is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an physician's first name"
                    },
                    stringLength: {
                        min: 1,
                        message: "First name must be at least 1 character long"
                    }
                }

            },
            reamPhysLastName: {

                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysFirstName','reamPhysLastName'];
                    var patAddrGroup = ['reamPhysFirstName'];
                    groupValidate(patAddrGroup);


                },
                message: "Physician's last name is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an physician's last name"
                    },
                    stringLength: {
                        min: 1,
                        message: "First name must be at least 1 character long"
                    }
                }
            },
            reamPhysCity: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysBusinessAddress','reamPhysCity','reamPhysProvince','reamPhysPostalCode'];
                    var patAddrGroup = ['reamPhysBusinessAddress', 'reamPhysProvince', 'reamPhysPostalCode'];
                    groupValidate(patAddrGroup);


                },
                message: "City is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an city"
                    },
                    stringLength: {
                        min: 2,
                        message: "City must be at least 2 character long"
                    }
                }
            },
            reamPhysProvince: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysBusinessAddress','reamPhysCity','reamPhysProvince','reamPhysPostalCode'];
                    var patAddrGroup = ['reamPhysBusinessAddress', 'reamPhysCity', 'reamPhysPostalCode'];
                    groupValidate(patAddrGroup);


                },
                message: "Province is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an province"
                    },
                    stringLength: {
                        min: 2,
                        message: "Choose a province!"
                    }
                }
            },
            reamPhysPostalCode: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysBusinessAddress','reamPhysCity','reamPhysProvince','reamPhysPostalCode'];
                    var patAddrGroup = ['reamPhysBusinessAddress', 'reamPhysCity', 'reamPhysProvince'];
                    groupValidate(patAddrGroup);
                },

                message: "Postal Code is required",
                validators: {
                    notEmpty: {
                        message: "Please provide the postal code"
                    },
                    zipCode: {
                        country: 'CA',
                        message: 'The value is not Canada valid postal code'
                    }
                }
            },
            reamPhysLicenceNo: {
                message: "Physician's licence number is required",
                validators: {
                    notEmpty: {
                        message: "Please provide the physician's licence number"
                    },
                    stringLength: {
                        min: 4,
                        message: "Physician's licence number must be at least 4 character long"
                    }
                }
            },
            reamPhysBusinessAddress: {
                trigger: 'change keyup',
                onSuccess: function (e, data) {
                    //var patAddrGroup=['reamPhysBusinessAddress','reamPhysCity','reamPhysProvince','reamPhysPostalCode'];
                    var patAddrGroup = ['reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode'];
                    groupValidate(patAddrGroup);
                },
                message: "Physician's address is required",
                validators: {
                    notEmpty: {
                        message: "Please provide the physician's address"
                    },
                    stringLength: {
                        min: 4,
                        message: "Physician's address must be at least 4 character long"
                    }
                }
            },
            reamPhysEmail: {
                message: "Email address is required",
                validators: {
                    notEmpty: {
                        message: "Please provide an email address"
                    },
                    stringLength: {
                        min: 6,
                        max: 100,
                        message: "Email address must be between 6 and 100 characters long"
                    },
                    emailAddress: {
                        message: "Email address was invalid"
                    }
                }

            },
            reamPhysPhone: {
                validators: {
                    phone: {
                        message: 'The input is not a valid phone number',
                        country: 'US'
                    }
                }
            },
            reamPhysFax: {
                validators: {
                    phone: {
                        message: 'The input is not a valid phone number',
                        country: 'US'
                    }
                }
            },

        }

    });//end var validator

    function validateSignature(idSignature) {
        if (isCanvasBlank(idSignature)) {
            //disable submit buttons
            document.getElementById('reamBtnSubmit').setAttribute('disabled', 'disabled');
            document.getElementById('reamBtnPrint').setAttribute('disabled', 'disabled');
            return false;
        }
        else {
            return true;
        }
    }



    validator.on("success.form.bv", function (e) {
        missedSignature = !validateSignature(idSignature);
        if (!missedSignature) {
            if (btnClicked == 'submit') {
                console.log('will call Amit web service');
                var jsonObject = form_collectingData();
                messageToParent("wholePrescriptionObjectForSubmit", jsonObject)
            }
            else if (btnClicked == 'print')
                window.print();
        }
        else {
            messageToParent("signForm", {});
            console.log('MISSING SIGNATURE');
        }


        e.preventDefault(); //to prevent it from actual submit



        //$("#reamForm").addClass("hidden");
        //$('#reamConfirmation').removeClass("hidden");

    });
}

function formValidate_initDatePicker() {
    var idDatepickers = ['reamMedScriptStart', 'reamMedScriptEnd','reamDob'];
    var id0= idDatepickers[0];
    $("#" + id0 ).datepicker(
            {
                dateFormat: 'yy-mm-dd',
                onSelect: function (d, prev) {
                    $('#reamForm').bootstrapValidator('revalidateField', id0);

                }
            }
            );
    var id1 = idDatepickers[1];
    $("#" + id1).datepicker(
            {
                dateFormat: 'yy-mm-dd',
                onSelect: function (d, prev) {
                    $('#reamForm').bootstrapValidator('revalidateField', id1);

                }
            }
            );
    var id2 = idDatepickers[2];
    $("#" + id2).datepicker(
            {
                dateFormat: 'yy-mm-dd',
                onSelect: function (d, prev) {
                    $('#reamForm').bootstrapValidator('revalidateField', id2);

                }
            }
            );

}

function formValidate_reset() {
    $('#reamForm').data('bootstrapValidator').resetForm();
}

function groupValidate(groupIds) {
    setTimeout(function () {
        console.log('VALIDATA GROUP ' + groupIds);
        for (var i = 0; i < groupIds.length; i++) {
            //$('#reamForm').data('bootstrapValidator').resetField(groupIds[i], false);//--> loop  updateStatus(field, 'NOT_VALIDATED')
            if (!$('#reamForm').data('bootstrapValidator').isValidField(groupIds[i])) {
               // console.log(groupIds[i] + ' value= ' + $('#' + groupIds[i]).val() + ' not valid');
                $('#reamForm').data('bootstrapValidator').updateStatus(groupIds[i], 'INVALID');
                break;

            }
            else {
                //console.log(groupIds[i] + ' value= ' + $('#' + groupIds[i]).val() + ' is valid');
            }
        }
    }, 500);
}

function groupConfirmInput(inputIds) {
    for (var i = 0; i < inputIds.length; i++) {
        // $('#' + groupIds[i]).change();
        var ele = document.getElementById(inputIds[i]);
        utility.__triggerKeyboardEventDown(ele, 65);
        utility.__triggerKeyboardEventUp(ele, 65);
        
    }
}

function isCanvasBlank(canvasId) {
    var canvas = document.getElementById(canvasId);
    var blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() == blank.toDataURL();
}


//---- form  -------------------------------------------------------
function form_clearAll() {
    initSignature_erase(idSignature);
    numberLoadFinished = 0;
    //..... adding more ....
}
function form_countload(num) {
    numberLoadFinished += num;
    if (numberLoadFinished >= 4)
        messageToParent("formLoadFinished", "");
}


function form_fillPatientFromQBE(rows) {
    formCommand.patient = formCommandType.create;
    dataFromHostPage.patient = rows[0];
    /*    a.title,	0
             a.last_name,	1
             a.first_name,	2
             concat(year_of_birth, '-', month_of_birth,'-',date_of_birth),	3
             a.sex,	4
             a.address,	5
             a.city,	6
             a.province,	7
             a.postal,	8
             a.phone,	9
             a.phone2,	10
             a.email,	11
             a.provider_no,	12
             a.roster_status,	13
             b.title,	14
             b.job_title,	15  provider who create demographic record (not provider who prescribe)
             b.first_name,	16
             b.last_name,	17
             b.dob,	18
             b.sex,	19
             b.phone,	20
             b.work_phone,	21
             b.billing_no,	22
             b.ohip_no,	23
             b.hso_no	24   */
    //-----fill in the form -------------
    var row = rows[0];
    var inputIds = ['reamFirstName', 'reamLastName', 'reamDob', 'reamEmail','reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal'];
    var indexes = [     2,              1,              3,          11      , 5,6,7,8];

    for (var i = 0; i < inputIds.length; i++) {
        if (i == 6) {
            if (row[indexes[i]].trim().length > 2)
                $('#' + inputIds[6]).val(mapProvince(row[indexes[i]].trim()));
            else
                $('#' + inputIds[i]).val(row[indexes[i]].trim());
        }
        else {
            $('#' + inputIds[i]).val(row[indexes[i]]);
        }

        
    }


    groupConfirmInput(['reamFirstName', 'reamLastName']);
    groupConfirmInput(['reamPatAddress', 'reamPatCity', 'reamPatProvince', 'reamPatPostal']);

    form_countload(1);
}

function form_fillProviderFromQBE(rows) {
    formCommand.physcisian = formCommandType.create;
    dataFromHostPage.provider = rows[0];
  /*  title	0
    job_title	1
    first_name	2
    last_name	3
    phone	4
    work_phone	5
    ohip_no	6
    billing_no	7
    hso_no	8
    email  9
    practitionerNo 10  */
    //-----fill in the form -------------
    var row = rows[0];
    var inputIds = ['reamPhysTitle', 'reamPhysFirstName', 'reamPhysLastName',  'reamPhysEmail','reamPhysPhone','reamPhysLicenceNo'];
    var indexes = [1,2,3,9,4];

    for (var i = 0; i < indexes.length; i++)
        $('#' + inputIds[i]).val(row[indexes[i]]);

    //-- reamPhysTitle
    var title = 'Doctor';
    if (row[1].trim() != "") title = row[1].trim();
    else if (row[0].trim() != "") title = row[0].trim();
    $('#' + inputIds[0]).val(title);
    //--reamPhysLicenceNo 
    var licence=row[10].trim();
    //if (row[6].trim() != '') licence = row[6].trim();
    //else if (row[7].trim() != '') licence = row[7].trim();
    //else if (row[8].trim() != '') licence = row[8].trim();
    $('#' + inputIds[5]).val(licence);

    groupConfirmInput(['reamPhysFirstName', 'reamPhysLastName']);
    form_countload(1);
}

function form_fillClinicFromQBE(rows) {
    formCommand.physcisian = formCommandType.create;

    dataFromHostPage.clinic = rows[0];
    /*
    clinic_name	0
    clinic_address	1
    clinic_city	2
    clinic_postal	3
    clinic_phone	4
    clinic_fax	5
    clinic_province	6
*/
    //-----fill in the form -------------
    var row = rows[0];
    var inputIds = ['reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode', 'reamPhysBusinessAddress', 'reamPhysPhone', 'reamPhysFax'];
    var indexes = [2,6,3,1,4,5];

    for (var i = 0; i < inputIds.length; i++)
        if(row[indexes[i]].trim()!='')
            $('#' + inputIds[i]).val(row[indexes[i]]);
    //--map province
    if (row[6].trim().length > 2) {
        var p = mapProvince(row[6]);
        $('#' + inputIds[1]).val(p);
    }
    groupConfirmInput(['reamPhysBusinessAddress', 'reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode']);
    form_countload(1);
}

function form_loadLicenceProducers(array) {
    dataFromHostPage.licenseProducer = array;
    //          [
    //{
    //    "id": 7,
    //    "name": "Peace Naturals Project Inc."
    //},...]

    var html='<option value="0">Choose One</option>';
    var i=0;
    while (i < array.length) {
        html += '<option value="' + array[i].id + '">' + array[i].name + '</option>';
        i++;
    }
    $('#reamMedSelectLp').html(html);
    form_countload(1);
}

function form_fillPatientFromApi(obj) {
    dataFromHostPage.patFromApi = obj;
    formCommand.patient = formCommandType.unchange;
    /*
                {
        "id": 941,
        "client_id": "941",
        "created_at": "9/25/2017 12:00:00 AM",
        "updated_at": "9/25/2017 12:00:00 AM",
        "clinic_id": 3,
        "base64_signature": null,
        "name": "JOHN TEST",
        "registration": {
            "id": 917,
            "title": "",
            "first_name": "JOHN",
            "middle_name": "",
            "last_name": "TEST",
            "date_of_birth": "1/15/1988 12:00:00 AM",
            "gender": "M",
            "native_status": "False",
            "establishment_name": "",
            "establishment_type": "",
            "establishment_first_name": "",
            "establishment_last_name": "",
            "street_1": "38 Eeastern",
            "street_2": "",
            "city": "",
            "province": "ON",
            "postal_code": "a2b2c2",
            "telephone_1": "",
            "fax_number": "",
            "telephone_2": "",
            "preferred_contact_time": "",
            "email": "hieun@i6tech.ca",
            "mailing_street_1": "38 Eeastern",
            "mailing_street_2": "",
            "mailing_city": "Brampton",
            "mailing_province": "ON",
            "mailing_postal_code": "a2b2c2",
            "physician_id": "0",
            "caregiver_1_title": "",
            "caregiver_1_first_name": "",
            "caregiver_1_last_name": "",
            "caregiver_1_date_of_birth": "1/1/1900 12:00:00 AM",
            "caregiver_1_gender": "",
            "caregiver_1_telephone": "",
            "caregiver_1_email": "",
            "caregiver_2_title": "",
            "caregiver_2_first_name": "",
            "caregiver_2_last_name": "",
            "caregiver_2_date_of_birth": "1/1/1900 12:00:00 AM",
            "caregiver_2_gender": "",
            "caregiver_2_telephone": "",
            "caregiver_2_email": "",
            "delivery_notes": "",
            "client_id": 941,
            "created_at": "9/25/2017 12:00:00 AM",
            "updated_at": "9/25/2017 12:00:00 AM",
            "preferred_name": "",
            "shipping_selection": "",
            "accepted_by_lp": "",
            "ample_care_id": "b74adb55-5724-4e52-96f9-b5ea418a6266",
            "knumber": ""
        }
                */

    var inputIds = ['reamFirstName', 'reamLastName', 'reamDob', 'reamEmail','reamPatAddress','reamPatCity','reamPatProvince','reamPatPostal','reamSelectShipping'];
    var keys = ['first_name', 'last_name', 'date_of_birth', 'email', 'street_1', 'mailing_city', 'province', 'postal_code', 'shipping_selection'];

    var regisObj= obj.registration;
    for (var i = 0; i < inputIds.length; i++) {
        $('#' + inputIds[i]).val(regisObj[keys[i]]);

    }
    //--
    $('#reamPatUpdatedAt').html(regisObj.updated_at);

    groupConfirmInput(['reamFirstName', 'reamLastName']);
    groupConfirmInput(['reamPatAddress', 'reamPatCity', 'reamPatProvince', 'reamPatPostal']);

    form_blockClient(true);
    form_countload(1);
}

function form_fillPhysFromApi(obj) {
    dataFromHostPage.physFromApi = obj;
    formCommand.physcisian = formCommandType.unchange;
    formCommand.signature = formCommandType.unchange;
    /* {
        "id": 118,
                "title": "Doctor",
                "first_name": "Sanjeev",
                "last_name": "Goel",
                "business_name": "",
                "street_1": "247 Main Street North",
                "street_2": "",
                "city": "Brampton",
                "province": "ON",
                "postal_code": "L6X 1N3",
                "telephone": "905-459-4385",
                "fax_number": "905-459-6373",
                "email": "hieu@idash.ca",
                "username": "1100001201782214149",
                "archived": false,
                "created_at": "9/22/2017 12:00:00 AM",
                "updated_at": "9/22/2017 12:00:00 AM",
                "professsion": "Physician",
                "signature": "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"
		"licence": "71460"
        }*/

    var phys_inputIds = ['reamPhysTitle', 'reamPhysFirstName', 'reamPhysLastName',  'reamPhysEmail','reamPhysPhone','reamPhysLicenceNo'];
    var clinic_inputIds = ['reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode', 'reamPhysBusinessAddress', 'reamPhysPhone', 'reamPhysFax'];

    var phys_keys = ["title", "first_name", "last_name", "email", "telephone", "licence"];
    var clinic_keys = ["city", "province", "postal_code", "street_1", "telephone", "fax_number"];

    for (var i=0; i<phys_inputIds.length; i++)
        $('#' + phys_inputIds[i]).val(obj[phys_keys[i]]);

    for (var i = 0; i < clinic_inputIds.length; i++)
        $('#' + clinic_inputIds[i]).val(obj[clinic_keys[i]]);

    //--
    $('#reamPhysUpdatedAt').html(obj.updated_at);
    //--load signature
    function loadSignature(pureUrl) {
        var canvasId = 'reamPhysSignature';//reamPhysSignature
        var dataUrl = "data:image/png;base64," + pureUrl;  //200x75 px
        var canvas = document.getElementById(canvasId);
        var ctx = canvas.getContext('2d');

        var img = new Image(200,75);
        img.onload = function () {
            ctx.drawImage(img, 0, 0,canvas.clientWidth,canvas.clientHeight); // Or at whatever offset you like
        };
        img.src = dataUrl;
        //document.getElementById('imgTest').src = dataUrl;
    }
    if (obj.signature != null && obj.signature != "")
        loadSignature(obj.signature);

    groupConfirmInput(['reamPhysFirstName', 'reamPhysLastName']);
    groupConfirmInput(['reamPhysBusinessAddress', 'reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode']);
    form_blockPhysician(true);
    form_blockSignature(true);

    form_countload(2);
}

function form_collectingData() {
    var phy_inputIds = ['reamPhysTitle', 'reamPhysFirstName', 'reamPhysLastName',  'reamPhysEmail','reamPhysPhone','reamPhysLicenceNo'];
    var clinic_inputIds = ['reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode', 'reamPhysBusinessAddress', 'reamPhysPhone', 'reamPhysFax'];
    var patient_inputIds = ['reamFirstName', 'reamLastName', 'reamDob', 'reamEmail', 'reamPatAddress', 'reamPatCity', 'reamPatProvince', 'reamPatPostal'];
    var obj,patGender,patPhone;
    if (formCommand.patient == formCommandType.create) {
        patGender = dataFromHostPage.patient[19];
        patPhone = dataFromHostPage.patient[5];
    }
    else {
        patGender = dataFromHostPage.patFromApi.registration.gender;
        patPhone = dataFromHostPage.patFromApi.registration.telephone_1;
    }
     obj = {
        "Physician": {
            "title": $('#' + phy_inputIds[0]).val(),
            "first_name": $('#' + phy_inputIds[1]).val(),
            "last_name": $('#' + phy_inputIds[2]).val(),
            "business_name": "",
            "street_1": $('#' + clinic_inputIds[3]).val(),
            "street_2": "",
            "city": $('#' + clinic_inputIds[0]).val(),
            "province": $('#' + clinic_inputIds[1]).val(),  //* 2 chars 
            "postal_code": $('#' + clinic_inputIds[2]).val(),
            "telephone": $('#' + phy_inputIds[4]).val(),
            "fax_number": $('#' + clinic_inputIds[5]).val(),
            "email": $('#' + phy_inputIds[3]).val(),
            "licence": $('#' + phy_inputIds[5]).val(),
            "username": "",  //* fhtId+providerNo+yyyMMddhhmmss
            "password": "",  //*
            "archived": false,
            "profession": "Physician"  //*
        },
        "Fht_Id": 0,
        "ProviderNo": 0,
        "PhysicianCommand": formCommand.physcisian,
        "Client": {
            "registration_attributes": {
                "title": "",
                "first_name": $('#' + patient_inputIds[0]).val().trim(),
                "middle_name":"",// $('#reamMidName').val(),
                "last_name": $('#' + patient_inputIds[1]).val().trim(),
                "date_of_birth": $('#' + patient_inputIds[2]).val().trim(),
                "gender": patGender,
                "native_status": "",
                "establishment_name": "",
                "establishment_type": "",
                "establishment_first_name": "",
                "establishment_last_name": "",
                "street_1": $('#' + patient_inputIds[4]).val().trim(),  //*
                "street_2": "",
                "city": $('#' + patient_inputIds[5]).val().trim(), //*
                "province": $('#' + patient_inputIds[6]).val().trim(),  //*
                "postal_code": $('#' + patient_inputIds[7]).val().trim(),  //*
                "telephone_1": patPhone,
                "fax_number": "",
                "telephone_2": "",
                "preferred_contact_time": "",
                "email": $('#' + patient_inputIds[3]).val(), //*
                "mailing_street_1": $('#' + patient_inputIds[4]).val().trim(),
                "mailing_street_2": "",
                "mailing_city": $('#' + patient_inputIds[5]).val().trim(),
                "mailing_province": $('#' + patient_inputIds[6]).val().trim(),  //*
                "mailing_postal_code": $('#' + patient_inputIds[7]).val().trim(),
                "caregiver_1_title": "",
                "caregiver_1_first_name": "",
                "caregiver_1_last_name": "",
                "caregiver_1_date_of_birth": "",
                "caregiver_1_gender": "",
                "caregiver_1_telephone": "",
                "caregiver_2_title": "",
                "caregiver_2_first_name": "",
                "caregiver_2_last_name": "",
                "caregiver_2_date_of_birth": "",
                "caregiver_2_gender": "",
                "caregiver_2_telephone": "",
                "delivery_notes": "",
                "client_id": 0,
                "preferred_name": "",
                "shipping_selection": $('#reamSelectShipping').val().trim()    //* residence, mailing, or physician
            }
        },
        "DemographicNo": 0,
        "ClientCommand": formCommand.patient,
        "Prescription": {
            "licensed_producer_id": parseInt( $('#reamMedSelectLp').val(),10),
            "diagnosis": $("#reamMedCondition").val(),
            "number_of_grams": parseFloat($('#reamMedGram').val(), 10),  // $('#').val(),
            "thc_limit_high": 0,
            "thc_limit_low": 0,
            "cbd_limit_high": 0,
            "cbd_limit_low": 0,
            "script_start": $('#reamMedScriptStart').val(),
            "script_end": $('#reamMedScriptEnd').val(),
            "archived": false,
            "physician_id": 0,
            "client_id": 0,
            "street_1": $('#' + patient_inputIds[4]).val().trim(),
            "street_2": "",
            "city": $('#' + patient_inputIds[5]).val().trim(),
            "province": $('#' + patient_inputIds[6]).val().trim(),
            "postal_code": $('#' + patient_inputIds[7]).val().trim(),
            "telephone": ""
        },
        "PrescriptionCommand": "create",
        "Signature": {
            "signature": ""
        }
     };

     if (formCommand.signature != formCommandType.unchange) {
         obj.Signature.signature = form_collectSignature();
     }

    return obj;

}

function form_collectSignature() {
    var canvasId = 'reamPhysSignature';
    function getImage200x75(canvasId) {
        var canvas = document.getElementById(canvasId);
        var pngUrl = canvas.toDataURL(); // PNG is the default, pngUrl is base64 encoded

        //---create 200x75 png image
        var canvas1 = document.createElement('canvas');
        canvas1.width = 200;
        canvas1.height = 75;
        var ctx1 = canvas1.getContext('2d');
        ctx1.drawImage(canvas, 0, 0, 200, 75);//draw on canvas1, source is canvas
        var pngUrl1 = canvas1.toDataURL(); // PNG is the default, pngUrl is base64 encoded
 
        return pngUrl1;
    }

    var pngUrl = getImage200x75(canvasId);

    var pureImgUrl = pngUrl.replace(/^data:image\/(png|jpg);base64,/, "");

    return pureImgUrl;
}

function form_blockClient(block) {//if block=true, disable all fields
    //$("input").prop('disabled', true);
    var inputIds = ['reamFirstName', 'reamLastName', 'reamDob', 'reamEmail', 'reamPatAddress', 'reamPatCity', 'reamPatProvince', 'reamPatPostal', 'reamSelectShipping'];
    for (var i = 0; i < inputIds.length; i++)
        $('#' + inputIds[i]).prop('disabled', block);

    if (block)
        $('#reamPatEditGroup').show();
    else
        $('#reamPatEditGroup').hide();
}

function form_blockPhysician(block) {//if block=true, disable all fields
    var phys_inputIds = ['reamPhysTitle', 'reamPhysFirstName', 'reamPhysLastName', 'reamPhysEmail', 'reamPhysPhone', 'reamPhysLicenceNo'];
    var clinic_inputIds = ['reamPhysCity', 'reamPhysProvince', 'reamPhysPostalCode', 'reamPhysBusinessAddress', 'reamPhysPhone', 'reamPhysFax'];

    for (var i = 0; i < phys_inputIds.length; i++)
        $('#' + phys_inputIds[i]).prop('disabled', block);
    for (var i = 0; i < clinic_inputIds.length; i++)
        $('#' + clinic_inputIds[i]).prop('disabled', block);

    if(block)
        $('#reamPhysEditGroup').show();
    else 
        $('#reamPhysEditGroup').hide();
}

function form_blockSignature(block) {
    var id = idSignature;
    if (block) {
        $('#' + id).css('pointer-events', 'none');
        //$('#' + id).css('cursor', 'wait');
        $('#reamPhysSignatureErase').css('display', 'none');
        $('#reamSignatureEdit').show();
    }
    else {
        $('#' + id).css('pointer-events', 'initial');
        $('#reamPhysSignatureErase').css('display', 'inline-block');
        $('#reamSignatureEdit').hide();
    }
}

//---- communicate with parent page-------------------------------

function messageToParent(message, dataObj) {
    var otherwindow = parent;
    var objSent = { from: "ampleCare", msg: message };
    if (dataObj) objSent.data = dataObj;
    otherwindow.postMessage(objSent, "*");
}

function messageReceive(event) {
    var data = event.data;
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object. why this one is null--> not use now
    if (data.from == 'encounter') {
        var rows = data.msg;
        if (data.command == 'loadPatientInfo') {
            console.log('FORM RECEIVED PATIENT DATA');
            console.log(JSON.stringify(rows));
            form_fillPatientFromQBE(rows);

        }
        else if (data.command == 'loadProviderInfo') {
            form_fillProviderFromQBE(rows);
        }
        else if (data.command == 'loadClinicInfo') {
            form_fillClinicFromQBE(rows);
        }
        else if (data.command == 'loadLP') {
            form_loadLicenceProducers(rows);
        }
        else if (data.command == 'resetValidate')
            formValidate_reset();

        else if (data.command == 'updateClientFromApi')
            form_fillPatientFromApi(data.msg);
        else if (data.command == 'updatePhysFromApi')
            form_fillPhysFromApi(data.msg);
    }


}


//---format data-----

function mapProvince(fullname){
    var abr = '0';
    fullname = fullname.toLowerCase();
    var fulls= ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Northwest Territories','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'];
    var abrs=['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];
    for(var i=0; i<fulls.length; i++)
        if (fullname == fulls[i].toLowerCase()) {
            abr = abrs[i];
            break;
        }
    return abr;
}

var utility = {
    __triggerKeyboardEventDown: function (el, keyCode) {
        var eventObj = document.createEventObject ?
                document.createEventObject() : document.createEvent("Events");

        if (eventObj.initEvent) {
            eventObj.initEvent("keydown", true, true);
        }

        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;

        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);
    },

    __triggerKeyboardEventUp: function (el, keyCode) {
        var eventObj = document.createEventObject ?
                document.createEventObject() : document.createEvent("Events");

        if (eventObj.initEvent) {
            eventObj.initEvent("keyup", true, true);
        }

        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;

        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeyup", eventObj);
    },


}







$(document).ready(function () {
    initForm();
    initSignature(idSignature, "black");
    formValidate_initDatePicker();
    formValidate_init();

    window.addEventListener("message", messageReceive, false);


    (function () {
    	var
		 form = $('#reamForm'),
		 cache_width = form.width(),
		 a4 = [595.28, 841.89]; // for a4 size paper width and height  

    	$('#create_pdf').on('click', function () {
    		$('body').scrollTop(0);
    		createPDF();
    	});
    	// create canvas object  
    	function getCanvas() {
    		form.width((a4[0] * 1.33333) - 80).css('max-width', 'none');
    		return html2canvas(form, {
    			imageTimeout: 2000,
    			removeContainer: true
    		});

    		
    	}
    	//create pdf  
    	function createPDF() {
    		html2canvas($("#reamForm"), {
    			onrendered: function (canvas) {
    				// canvas is the final rendered <canvas> element
    				var myImage = canvas.toDataURL("image/png");  //'image/png'
    				//window.open(myImage);
    				var ele = document.createElement('div');
    				
    				var pHtml = "<img src=" + myImage + " />";
    				ele.innerHTML = pHtml;
    				document.body.appendChild(ele);



    					var doc = new jsPDF({
    					 	unit: 'px',
    					 	format: 'a4'
    					 });
    					doc.addImage(myImage, 'PNG', 0,0);
    					//doc.save('Bhavdip-html-to-pdf.pdf');//download in browser
						var dataUri = doc.output('datauri'); //data:application/pdf;base64,JVBERi0xL......
						var dataArray = doc.output('arraybuffer');
						var dataArrayUint8 = new Uint8Array(doc.output('arraybuffer'));
						var blob = new Blob(dataArrayUint8, { type: "application/pdf" });


						var dataArrayBase64 = btoa(dataArrayUint8);
						var dataUriString = doc.output('datauristring'); //same as dataUri
						var dataRaw = btoa(doc.output()); //raw string
						var numberOfPages = doc.internal.getNumberOfPages();
    					window.open(dataUri);
    			}
    		});


    		//getCanvas();
    		//.then(function (canvas) {
    		//	var
			//	 img = canvas.toDataURL("image/png"),
			//	 doc = new jsPDF({
			//	 	unit: 'px',
			//	 	format: 'a4'
			//	 });
    		//	doc.addImage(img, 'JPEG', 20, 20);
    		//	doc.save('Bhavdip-html-to-pdf.pdf');
    		//	form.width(cache_width);
    		//});
    	}

  

    }());


});

//---------------------------------------------------------------------------- for pdf


    /* 
 * jQuery helper plugin for examples and tests 
 */  
    (function ($) {  
    	$.fn.html2canvas = function (options) {  
    		var date = new Date(),  
            $message = null,  
            timeoutTimer = false,  
            timer = date.getTime();  
    		html2canvas.logging = options && options.logging;  
    		html2canvas.Preload(this[0], $.extend({  
    			complete: function (images) {  
    				var queue = html2canvas.Parse(this[0], images, options),  
                    $canvas = $(html2canvas.Renderer(queue, options)),  
                    finishTime = new Date();  
  
    				$canvas.css({ position: 'absolute', left: 0, top: 0 }).appendTo(document.body);  
    				$canvas.siblings().toggle();  
  
    				$(window).click(function () {  
    					if (!$canvas.is(':visible')) {  
    						$canvas.toggle().siblings().toggle();  
    						throwMessage("Canvas Render visible");  
    					} else {  
    						$canvas.siblings().toggle();  
    						$canvas.toggle();  
    						throwMessage("Canvas Render hidden");  
    					}  
    				});  
    				throwMessage('Screenshot created in ' + ((finishTime.getTime() - timer) / 1000) + " seconds<br />", 4000);  
    			}  
    		}, options));  
  
    		function throwMessage(msg, duration) {  
    			window.clearTimeout(timeoutTimer);  
    			timeoutTimer = window.setTimeout(function () {  
    				$message.fadeOut(function () {  
    					$message.remove();  
    				});  
    			}, duration || 2000);  
    			if ($message)  
    				$message.remove();  
    			$message = $('<div ></div>').html(msg).css({  
    				margin: 0,  
    				padding: 10,  
    				background: "#000",  
    				opacity: 0.7,  
    				position: "fixed",  
    				top: 10,  
    				right: 10,  
    				fontFamily: 'Tahoma',  
    				color: '#fff',  
    				fontSize: 12,  
    				borderRadius: 12,  
    				width: 'auto',  
    				height: 'auto',  
    				textAlign: 'center',  
    				textDecoration: 'none'  
    			}).hide().fadeIn().appendTo('body');  
    		}  
    	};  
    })(jQuery);  

