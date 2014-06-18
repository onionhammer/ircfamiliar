interface AjaxResponse {
    code: number
    data: string
}

function ajax(path: string, data: any, callback: (e: AjaxResponse) => void, method = "POST") {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState !== 4)
            return;

        callback(<AjaxResponse>{
            code: xhr.status,
            data: xhr.responseText
        });
    };

    xhr.open(method, path, true);
    xhr.send(data);
}