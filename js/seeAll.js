//一键查看总体分布
$("#seeAllPositon").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/get_allPosition',
        type: "get",
        // 刷新地图
        success: function (data) {
            //处理获取到的数据, data是一个列表,每个项都是一个二元组代表了一个地理坐标
            //创建地图
            var map = initMap({
                tilt: 0,
                heading: 0,
                center: [108.842898, 34.12905],
                zoom: 16,
                // style: purpleStyle
            });
            //创建图层管理器
            var view = new mapvgl.View({
                effects: [
                    new mapvgl.BloomEffect({
                        threshold: 0.2,
                        blurSize: 2.0
                    }),
                ],
                map: map
            });
            var data1 = JSON.parse(data) //data为JavaScript数据对象,每个成员都是一个数组代表一个坐标点
            //添加热力点图层观看人员分布
            //获取所有坐标数据
            var result = [];
            for (var i in data1) {
                result.push({
                    geometry: {
                        type: 'POINT',
                        coordinates: [data1[i][0], data1[i][1]]
                    }
                });
            }
            var layer2 = new mapvgl.HeatPointLayer({
                blend: 'lighter',
                style: 'normal',
                girdSize: 50,
                shape: 'circle',
                size: 5,
                min: 1,
                max: 50,
                data: result,
                gradient: {
                    0.0: 'rgb(50, 50, 256)',
                    0.1: 'rgb(50, 250, 56)',
                    0.5: 'rgb(250, 250, 56)',
                    1.0: 'rgb(250, 50, 56)'
                }
            });
            view.addLayer(layer2);
        }
    });
});

//一键查看所有高风险个体信息
$("#seeAllRiskPerson").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/search_top_person',
        type: "get",
        success: function (data) {
            //处理获取到的数据, data是一个列表,每个项都是一条个人数据
            var map = initMap({
                tilt: 0,
                heading: 0,
                center: [108.842898, 34.12905],
                zoom: 16,
                style: purpleStyle
            });
            var view = new mapvgl.View({
                effects: [
                    new mapvgl.BloomEffect({
                        threshold: 0.2,
                        blurSize: 2.0
                    }),
                ],
                map: map
            });
            data1 = JSON.parse(data);
            var position = [];
            // 获取位置信息在地图上显示
            for (var i in data1) {
                position.push({
                    geometry: {
                        type: 'POINT',
                        coordinates: [data1[i]['lastPosition'][0], data1[i]['lastPosition'][1]]
                    }
                });
            }
            var layer3 = new mapvgl.HeatPointLayer({
                blend: 'lighter',
                style: 'normal',
                shape: 'circle',
                size: 5,
                data: position,
                gradient: {
                    0.0: 'rgb(50, 50, 256)',
                    0.1: 'rgb(50, 250, 56)',
                    0.5: 'rgb(250, 250, 56)',
                    1.0: 'rgb(250, 50, 56)'
                }
            });
            view.addLayer(layer3);
            var infos = [];
            for (var i in data1) {
                var ite = $("<tr class='tableRow'></tr>").append($("<th class='dangerInfo'></th>").text(data1[i]['ID'])).append($("<th class='dangerInfo'></th>").text(data1[i]['name'])).append($("<th class='dangerInfo'></th>").text(data1[i]['riskValue']))
                infos.push(ite)
            }
            //清除之前的搜索信息
            $("#table_for_info").children().remove()
            $("#table_for_info").append($("<tr id='head'></tr>").append($("<th class='dangerInfo'>个人ID</th>")).append($("<th class='dangerInfo'>姓名</th>")).append($("<th class='dangerInfo'>风险值</th>")))
            for (var i in infos) {
                $("#table_for_info").append(infos[i])
            }
        }
    });
});

//一键查看所有高风险群体信息
$("#seeAllRiskSocial").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/search_top_social',
        type: "get",
        success: function (data) {
            let i;
//处理获取到的数据, data是一个列表,每个项都是一条群体数据
            data1 = JSON.parse(data);
            //将高风险群体信息打印到屏幕上
            var infos = [];
            for (i in data1) {
                var ite = $("<tr class='tableRow'></tr>").append($("<th class='dangerInfo'></th>").text(data1[i]['ID'])).append($("<th class='dangerInfo'></th>").text(data1[i]['riskValue'])).append($("<th class='dangerInfo'></th>").text(data1[i]['memberCount']));
                infos.push(ite);
            }
            //清除之前的搜索信息
            $("#table_for_info").children().remove();
            $("#table_for_info").append($("<tr id='head'></tr>").append($("<th class='dangerInfo'>社团ID</th>")).append($("<th class='dangerInfo'>风险值</th>")).append($("<th class='dangerInfo'>成员数量</th>")))
            for (i in infos) {
                $("#table_for_info").append(infos[i]);
            }
        }
    });
});

//一键获取高风险社团网络信息
$("#top_s2p").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_socialsNetwork',
        type: "get",
        success: function (data) {
            //处理获取到的数据, data是一个列表,每个项都是一条群体数据
            let data1 = JSON.parse(data);
            let relationChart = echarts.init(document.getElementById("relationChart"));
            let data_person = data1["persons"];
            let data_social = data1["socials"];
            let cts = [];
            let dt = [];
            let lk = [];
            let can_color = [
                '#0000ff',
                '#00ff00',
                '#ff0000',
                '#ffff00',
                '#ff00ff',
                '#00ffff'
            ];

            // 初始化团体种类
            for (let i = 0; i < 10; i++) {
                cts.push({
                    name: 's' + data_social[i]['ID'],
                    itemStyle: {
                        normal: {
                            color: can_color[i % 6]
                        }
                    }
                });
            }

            // 准备团体数据
            for (let i = 0; i < 10; i++) {
                dt.push({
                    name: 's' + data_social[i]['ID'],
                    category: i,
                    draggable: true,
                    symbol: 'circle',
                    symbolSize: [20, 20]
                });
            }

            // 判断一个个体的数据是否已经填入
            function person_not_in(pid) {
                let temp = 'p' + pid;
                for (let i = 0; i < dt.length; i++) {
                    if (dt[i].name === temp) {
                        return false;
                    }
                }
                return true;
            }

            //给定一个个体ID找出他在dt中的位置
            function indexPerson(pid) {
                for (let k = 0; k < dt.length; k++) {
                    if (dt[k].name === ('p' + pid)) {
                        return k;
                    }
                }
                return 'none';
            }

            // 准备个体数据和链接
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < data_social[i]['membersSequenceID'].length; j++) {
                    if (person_not_in(data_social[i]['membersSequenceID'][j])) {
                        dt.push({
                            name: 'p' + data_social[i]['membersSequenceID'][j],
                            category: i,
                            draggable: true,
                            symbol: 'circle',
                            symbolSize: [10, 10]
                        });
                    }
                    let indexP = indexPerson(data_social[i]['membersSequenceID'][j]);
                    if (indexP !== 'none') {
                        lk.push({
                            source: i,
                            target: indexP,
                            value: ''
                        })
                    }
                }
            }

            let lb = {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    }
                }
            };

            let sers = [{
                type: 'graph',
                symbolSize: 45,
                focusNodeAdjacency: true,
                roam: true,
                layout: 'force',
                force: {
                    repulsion: 200 //斥力因子，值越大，斥力越大
                },
                label: lb,
                edgeSymbolSize: [4, 50],
                edgeLabel: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 10
                        },
                        formatter: "{c}"
                    }
                },
                categories: cts,//将所有点分为n个团体
                data: dt,//给每个人分配一个团体
                links: lk,//给两个人添加一条边
                lineStyle: {
                    normal: {
                        opacity: 0.9,
                        width: 1,
                        curveness: 0
                    }
                }
            }];
            let relationOpt = {
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                label: lb,
                series: sers
            };
            relationChart.setOption(relationOpt);
        }
    });
});

//一键获取高风险个体网络信息
$("#top_p2p").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_topPersonsRisk',
        type: "get",
        success: function (data) {
            //处理获取到的数据, data是一个列表,每个项都是一条群体数据
            let data1 = JSON.parse(data);
            let relationChart = echarts.init(document.getElementById("relationChart"));
            let data_person = data1["persons"];
            let cts = [];
            let dt = [];
            let lk = [];
            let can_color = [
                '#0000ff',
                '#00ff00',
                '#ff0000',
                '#ffff00',
                '#ff00ff',
                '#00ffff'
            ];

            // 初始化高风险个体种类
            for (let i = 0; i < 10; i++) {
                cts.push({
                    name: 'p' + data_person[i]['ID'],
                    itemStyle: {
                        normal: {
                            color: can_color[i % 6]
                        }
                    }
                });
            }

            // 准备个体数据
            for (let i = 0; i < 10; i++) {
                dt.push({
                    name: 'p' + data_person[i]['ID'],
                    category: i,
                    draggable: true,
                    symbol: 'circle',
                    symbolSize: [20, 20]
                });
            }

            // 判断一个团体的数据是否已经填入
            function social_not_in(sid) {
                let temp = 's' + sid;
                for (let i = 0; i < dt.length; i++) {
                    if (dt[i].name === temp) {
                        return false;
                    }
                }
                return true;
            }

            //给定一个社团ID找出他在dt中的位置
            function indexSocial(sid) {
                for (let k = 0; k < dt.length; k++) {
                    if (dt[k].name === ('s' + sid)) {
                        return k;
                    }
                }
                return 'none';
            }

            // 准备社团数据和链接
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < data_person[i]['socialGroupID'].length; j++) {
                    if (social_not_in(data_person[i]['socialGroupID'][j])) {
                        dt.push({
                            name: 's' + data_person[i]['socialGroupID'][j],
                            category: i,
                            draggable: true,
                            symbol: 'circle',
                            symbolSize: [10, 10]
                        });
                    }
                    let indexP = indexSocial(data_person[i]['socialGroupID'][j]);
                    if (indexP !== 'none') {
                        lk.push({
                            source: i,
                            target: indexP,
                            value: ''
                        })
                    }
                }
            }

            let lb = {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    }
                }
            };

            let sers = [{
                type: 'graph',
                symbolSize: 45,
                focusNodeAdjacency: true,
                roam: true,
                layout: 'force',
                force: {
                    repulsion: 320 //斥力因子，值越大，斥力越大
                },
                label: lb,
                edgeSymbolSize: [4, 50],
                edgeLabel: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 10
                        },
                        formatter: "{c}"
                    }
                },
                categories: cts,//将所有点分为n个团体
                data: dt,//给每个人分配一个团体
                links: lk,//给两个人添加一条边
                lineStyle: {
                    normal: {
                        opacity: 0.9,
                        width: 1,
                        curveness: 0
                    }
                }
            }];
            let relationOpt = {
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                label: lb,
                series: sers
            };
            relationChart.setOption(relationOpt);
        }
    });
});

//按姓名获取个体信息
$("#search_person_by_name").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/search_person_by_name',
        type: "get",
        data: $('#form_search_person_by_name').serialize(),
        success: function (data) {
            //处理获取到的数据, data是一个列表,每个项都是一条个人数据
            data1 = (JSON.parse(data))[0]
            $(".info_person").remove()
            $(".info_social").remove()
            var txt1 = $("<p class='info_person'></p>").text("个体ID:       " + data1['ID'])
            var txt2 = $("<p class='info_person'></p>").text("姓名:     " + data1['name'])
            var txt3 = $("<p class='info_person'></p>").text("风险值:   " + data1['riskValue'])
            var txt4 = $("<p class='info_person'></p>").text("当前位置: " + data1['lastPosition'])
            var txt5 = $("<p class='info_person'></p>").text("关联社团: " + data1['socialGroupID'])
            $("#information").append(txt1, txt2, txt3, txt4, txt5)
        }
    });
});

//按ID获取个体信息
$("#search_person_by_id").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/search_person_by_id',
        type: "get",
        data: $('#form_search_person_by_id').serialize(),
        success: function (data) {
            data1 = (JSON.parse(data))
            $(".info_person").remove()
            $(".info_social").remove()
            var txt1 = $("<p class='info_person'></p>").text("个体ID:       " + data1['ID'])
            var txt2 = $("<p class='info_person'></p>").text("姓名:     " + data1['name'])
            var txt3 = $("<p class='info_person'></p>").text("风险值:   " + data1['riskValue'])
            var txt4 = $("<p class='info_person'></p>").text("当前位置: " + data1['lastPosition'])
            var txt5 = $("<p class='info_person'></p>").text("关联社团: " + data1['socialGroupID'])
            $("#information").append(txt1, txt2, txt3, txt4, txt5)
        }
    });
});

//按ID获取社团信息
$("#search_social_by_id").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/search_social_by_id',
        type: "get",
        data: $('#form_search_social_by_id').serialize(),
        success: function (data) {
            data1 = (JSON.parse(data))
            $(".info_person").remove()
            $(".info_social").remove()
            var txt1 = $("<p class='info_social'></p>").text("社团ID:       " + data1['ID'])
            var txt2 = $("<p class='info_social'></p>").text("风险值:     " + data1['riskValue'])
            var txt3 = $("<p class='info_social'></p>").text("成员个数:   " + data1['memberCount'])
            var txt4 = $("<p class='info_social'></p>").text("关联成员ID: " + data1['membersSequenceID'])
            $("#information").append(txt1, txt2, txt3, txt4)
        }
    });
});

//按ID分析个人轨迹
$("#analysis_personPath").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_personPath',
        type: "get",
        data: $('#form_analysis_path').serialize(),
        success: function (data) {
            // 百度地图API功能
            var data1 = JSON.parse(data)
            var map = new BMap.Map("map_container");
            map.centerAndZoom(new BMap.Point(108.840841, 34.130379), 17);
            map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
            map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
            var myP1 = new BMap.Point(data1[0][0], data1[0][1]);    //起点
            var myP2 = new BMap.Point(data1[1][0], data1[1][1]);    //终点
            var myIcon = new BMap.Icon("../static/img/豆子.png", new BMap.Size(70, 70), {
                offset: new BMap.Size(0, -5),    //相当于CSS精灵
                imageOffset: new BMap.Size(0, 0)    //图片的偏移量。为了是图片底部中心对准坐标点。
            });
            var driving2 = new BMap.DrivingRoute(map, {renderOptions: {map: map, autoViewport: true}});    //驾车实例
            driving2.search(myP1, myP2);    //显示一条公交线路
            window.run = function () {
                var driving = new BMap.DrivingRoute(map);    //驾车实例
                driving.search(myP1, myP2);
                driving.setSearchCompleteCallback(function () {
                    var pts = driving.getResults().getPlan(0).getRoute(0).getPath();    //通过驾车实例，获得一系列点的数组
                    var paths = pts.length;    //获得有几个点
                    var carMk = new BMap.Marker(pts[0], {icon: myIcon});
                    map.addOverlay(carMk);
                    i = 0;

                    function resetMkPoint(i) {
                        carMk.setPosition(pts[i]);
                        if (i < paths) {
                            setTimeout(function () {
                                i++;
                                resetMkPoint(i);
                            }, 150);
                        }
                    }

                    setTimeout(function () {
                        resetMkPoint(5);
                    }, 150)
                });
            }
            setTimeout(function () {
                run();
            }, 1500);
        }
    });
});

//分析个体风险分布情况
$("#analysis_person_risk").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_person_risk',
        type: "get",
        success: function (data) {
            let data0 = JSON.parse(data);
            let data1 = [];
            let data2 = [];
            for (let i in data0) {
                data1.push(i);
                data2.push(data0[i])
            }
            let dom = document.getElementById("relationChart");
            let myChart = echarts.init(dom);
            let option = {
                xAxis: {
                    type: 'category',
                    data: data1
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    data: data2,
                    type: 'line',
                    smooth: true
                }]
            };
            myChart.setOption(option, true);
        }
    });
});


//按ID分析个人社交关系（一级关联分析）
$("#analysis_personNetwork").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_personNetwork',
        type: "get",
        data: $('#form_analysis_personNetwork').serialize(),
        success: function (data) {
            let i;
            let data1 = JSON.parse(data);
            let relationChart = echarts.init(document.getElementById("relationChart"));
            let cts = [];
            let dt = [];
            let lk = [];
            console.log(data1);
            // 初始化团体种类
            for (i = 0; i < data1.length - 1; i++) {
                cts.push({
                    name: data1[i],
                    itemStyle: {
                        normal: {
                            color: '#4af216'
                        }
                    }
                })
            }
            cts.push({
                name: data1[data1.length - 1],
                itemStyle: {
                    normal: {
                        color: '#f2637b'
                    }
                }
            });
            //初始化数据点
            for (i = 0; i < data1.length; i++) {
                dt.push({
                    name: data1[i],
                    category: i,
                    draggable: true
                })
            }
            for (i = 0; i < data1.length - 1; i++) {
                lk.push({
                    source: data1.length - 1,
                    target: i,
                    value: ''
                })
            }
            let lb = {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    }
                }
            };
            const sers = [{
                type: 'graph',
                symbolSize: 45,
                focusNodeAdjacency: true,
                roam: true,
                layout: 'force',
                force: {
                    repulsion: 320 //斥力因子，值越大，斥力越大
                },
                label: lb,
                edgeSymbolSize: [4, 50],
                edgeLabel: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 10
                        },
                        formatter: "{c}"
                    }
                },
                categories: cts,//将所有点分为n个团体
                data: dt,//给每个人分配一个团体
                links: lk,//给两个人添加一条边
                lineStyle: {
                    normal: {
                        opacity: 0.9,
                        width: 1,
                        curveness: 0
                    }
                }
            }];
            const relationOpt = {
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                label: lb,
                series: sers
            };
            relationChart.setOption(relationOpt);
        }
    });
});

//按ID分析个人社交关系（多级关联分析,分析深度可以自定义）
$("#analysis_N_personNetwork").click(function () {
    $.ajax({
        url: 'http://127.0.0.1:5000/analysis_personMultiAssociation',
        type: "get",
        data: $('#form_analysis_personMultiAssociation').serialize(),
        success: function (data) {
            let data1 = JSON.parse(data);
            let relationChart = echarts.init(document.getElementById("relationChart"));
            // 传入一颗JSON树，将其转换为echarts中的树数据
            function convertTree(jsonTree) {
                let chartTree = {
                    name: jsonTree.name,
                    value: jsonTree.ID,
                    // label: {
                    //     show: jsonTree.ID
                    // },
                    children: jsonTree.children
                };
                if (chartTree.children.length === 0) {
                    delete (chartTree.children);
                    return chartTree;
                }
                for (let i = 0; i < chartTree.children.length; i++) {
                    chartTree.children[i] = convertTree(jsonTree.children[i]);
                }
                return chartTree;
            }
            let tree_data = convertTree(data1);
            console.log(data1);
            console.log(tree_data);
            let myOption = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [{
                    type: 'tree',
                    data: [tree_data],
                    left: '2%',
                    right: '2%',
                    top: '8%',
                    bottom: '20%',
                    symbol: 'emptyCircle',
                    orient: 'LR',
                    expandAndCollapse: true,
                    label: {
                        position: 'top',
                        rotate: -90,
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 9
                    },
                    leaves: {
                        label: {
                            position: 'bottom',
                            rotate: -90,
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    },
                    animationDurationUpdate: 750
                }]
            };
            relationChart.setOption(myOption);
        }
    });
});
