var bottom_hit = false;
let bottom_offset = 150;
let count = [0,0];
let clm = 5;
var starter = 1;
window.onorientationchange = redefineCells;
defineRes();
getRows(2);


function getRows(rows) {
    bottom_hit = true;
    getCells(rows, clm, starter, count);
}

function getCells(rows, columns, starts_at, cnt) {

    fetch(`/api/cells?rows=${rows}&columns=${columns}&starts_at=${starts_at}&cnt=${cnt}`)
        .then(res => res.json())
        .then(data => {
            starter += rows;
            handleBlanks('remove');
            setCells(data, rows, starts_at);
            bottom_hit = false;
        });
}

//Sets Grid and Horizontal position styles
function setColumnStyles() {
    let wdth = Math.round(84.0 / clm / 1.36);
    $("style").remove();
    $('head').append($('<style type="text/css"></style>'));
    $('style').append(`.grid{\ndisplay: grid;\ngrid-template-rows: repeat(100%, 1fr);\ngrid-template-columns: repeat(${clm*2}, 1fr);\njustify-items: center;\nalign-items: center;}`);
    $('style').append(`.img_wrap{\nwidth:${wdth}vw;\nheight:${wdth}vw;\n}`);
    for (i = 0; i < clm; i++) {
        let nm = `column${i+1}odd`;
        $('style').append(`\n.${nm}{\ngrid-column:${(i + 1) * 2 - 1}/${(i + 1) * 2 + 1};\n}`);
    }

    for (i = 0; i < clm - 1; i++) {
        let nm = `column${i+1}even`;
        $('style').append(`\n.${nm}{\ngrid-column:${(i + 1) * 2 }/${(i + 1) * 2 + 2};\n}`);
    }
}


//Using json data sets all cels
function setCells(dat, rows, st) {

    var pics = dat['data'];
    //console.log(pics.length);
    let idxs = [0,0]
    for (i = st - 1; i < st - 1 + rows; i++) {
        let nm = `row${i+1}`;
        $('style').append(`\n.${nm}{\ngrid-row:${i + 1}/${i + 3};\n}`);
        let cls = Math.round((i + 1) % 2);
        let typ = ["even", "odd"];
        for (j = 0; j < clm - 1 + cls; j++) {
            let $content = $("<a>", { "href": `${pics[cls][idxs[cls]]['link']}` });
            let $img_wrap = $("<div>", { "class": "img_wrap" }).append($("<img>", { "class": "image", "src": `${pics[cls][idxs[cls]]['img_url']}` }));
            $content.append($img_wrap);
            $content.append($("<div>", { "class": "ov_one" }));
            $content.append($("<div>", { "class": "ov_two" }));
            $content.append($("<div>", { "class": "ov_three" }));
            let $load = $("<div>", { "class": `item row${i+1} column${j+1}${typ[cls]}` }).append($("<div>", { "class": "container", "title": `${pics[cls][idxs[cls]]['title']}` }).append($content));
            $('.grid').append($load);
            count[cls] +=1;
            idxs[cls] += 1;
        }
    }
    if(document.documentElement.getBoundingClientRect().bottom <= window.innerHeight+bottom_offset)
    {
        getRows(1);
    }
}


function handleBlanks(type) {
    switch (type) {
        case 'add':
            typ = starter % 2;
            for (i = 0; i < clm - 1 + typ; i++) {
                console.log(i);
                var $load = $("<div>", { "class": "loading" });
                var $contain = $("<div>", { "class": "container-l" });
                var $img = $("<img>", { "class": "image", "src": "pics/no-pic.jpg" });
                $contain.append($img);
                $load.append($contain);
                $load.attr("style", "grid-row:" + starter + "/" + (starter + 1) + ";grid-column: " + ((2 * i) + 2 - typ) + "/" + ((2 * i) + 4 - typ) + ";");
                console.log($load)
                $('.grid').append($load);
            }
            break;

        case 'remove':
            $(".loading").remove();
            break;

        default:
            console.log('default hit')
            break;
    }

}


function bodyScroll() {
    let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom <= document.documentElement.clientHeight + bottom_offset && bottom_hit == false) {
        getRows(3);
        handleBlanks('add');
    }

}

function defineRes()
{
    clm = Math.max(2, Math.round(window.screen.width / 400));
    clm = Math.min(5, clm);
    setColumnStyles();
}


function redefineCells()
{
    //console.log('Current orientation is ' + screen.orientation.type);
    defineRes();
    let $list = $(".item").toArray();
    let frac = Math.floor($list.length / (2*clm-1));
    if($list.length-(frac*(2*clm-1)) == clm)
    {
        starter = frac*2+2;
    }
    else
    {
        if($list.length-(frac*(2*clm-1)) > clm)
        {
            starter = frac*2+2;
        }
        else
        {
            starter = frac*2+1;
        }
        getRows(1);
    }

    $('.item').remove();

    let idx = 0;

    for (i = 0; i < starter-1; i++)
    {
        let nm = `row${i+1}`;
        $('style').append(`\n.${nm}{\ngrid-row:${i + 1}/${i + 3};\n}`);
        let cls = Math.round((i + 1) % 2);
        let typ = ["even", "odd"];
        for (j = 0; j < clm - 1 + cls; j++) {
            $($list[idx]).attr('class', `item row${i+1} column${j+1}${typ[cls]}`);
            idx += 1;
        }
    }
    $('.grid').append($list.slice(0,idx));
}