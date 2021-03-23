let app_sheet1 = new Vue({
	el:"#center_app",
	data:{
		sheetOneControlValue:"整体环境感知",
		sheetTowControlValue:"风险个体监控",
		sheetThreeControlValue:"风险群体监控",
		sheet1IsNotShowValue:false,
		sheet2IsNotShowValue:true,
		sheet3IsNotShowValue:true
	},
	methods:{
		sheetOneShow:function(){
			this.sheet1IsNotShowValue = false;
			this.sheet2IsNotShowValue = true;
			this.sheet3IsNotShowValue = true;
		},
		sheetTowShow:function(){
			this.sheet1IsNotShowValue = true;
			this.sheet2IsNotShowValue = false;
			this.sheet3IsNotShowValue = true;
		},
		sheetThreeShow:function(){
			this.sheet1IsNotShowValue = true;
			this.sheet2IsNotShowValue = true;
			this.sheet3IsNotShowValue = false;
		},
		sheet1Test:function(){
			alert("个体基本信息\n 姓名：XXX\n 年龄：XX \n......")
		},
		sheet2Test:function(){
			alert("风险个体基本信息\n 姓名：XXX\n 年龄：XX \n......")
		},
		sheet3Test:function(){
			alert("群体基本信息\n 姓名：XXX\n 年龄：XX \n......")
		}
	}
})