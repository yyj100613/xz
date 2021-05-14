const express = require("express");
//导入连接池
const pool = require("../pool.js");
//创建路由器
let router = express.Router();
router.post('/reg',(req,res)=>{
	//遍历请求对象，判断用户名、密码、邮箱、电话否为空，作出相应的响应
	//将msg定义为数组，用变量m控制打印出的信息****不能为空
	var arr=['用户名不能为空','密码不能为空','邮箱不能为空','电话不能为空'];
	var m=-1;
	var n=400;
	for(var a in req.body){
		m++;
		n++;
		if(!req.body[a]){
			res.send({
				code:n,
				msg:`${arr[m]}`
			});
			return;
		}
	}
	//用户名若已存在则不允许注册
	pool.query('select * from xz_user where uname=?',req.body.uname,(err,result)=>{
		if(err){
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		//用户名存在，响应用户名已注册，请重新注册
		if(result.length>0){
			res.send(`${req.body.uname}用户名已注册，请重新注册`);
		}else{
			//用户名不存在，用户注册
			pool.query('insert into xz_user set ?',req.body,(err,result)=>{
				if(err) throw err;
				if(result.affectedRows>0){
					res.send({
						code:200,
						msg:'register sucess'});
				}
			});
		}
	});	
});
//判断用户名和密码是否为空，分别作出响应
router.post('/login',(req,res)=>{
	if(!req.body.uname){
		res.send({
			code:401,
			msg:'用户名不能为空'
		});
		return;
	}
	if(!req.body.upwd){
		res.send({
			code:402,
			msg:'密码不能为空'
		});
		return;
	}
	//用户名和密码都正确跳转到首页，否则登录失败
	pool.query('select * from xz_user where uname=? and upwd=?',[req.body.uname,req.body.upwd],(err,result)=>{
		if(err){
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.length > 0){
			/*
			var index=__dirname.lastIndexOf('router');
			var baseParse=__dirname.slice(0,index);
			res.sendFile(baseParse+'public/index.html');
			*/
			res.redirect('/index.html');
		}else{
			res.send({
				code:301,
				msg:'用户名或密码错误'
			});
		}
	});
});
/*
router.get('/detail',(req,res)=>{
	//uid未提供，提示401，uid为空
	if(!req.query.uid){
		res.send({
			code:401,
			msg:'用户ID不能为空'
		});
	}
	//根据uid显示服务器数据
	pool.query('select * from xz_user where uid=?',req.query.uid,(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.length>0){
			res.send({
				code:200,
				msg:'用户信息如下',
				data:result[0]
			});
		}else{
			res.send({
				code:301,
				msg:'该用户不存在！'
			});
		}
	});
});
*/
router.post('/detail',(req,res)=>{
	//uid未提供，提示401，uid为空
	if(!req.body.uid){
		res.send({
			code:401,
			msg:'用户编号不能为空'
		});
		return;
	}
	//根据uid显示服务器数据,select结果为数组，数组长度大于0说明用户存在，否则不存在
	pool.query('select * from xz_user where uid=?',req.body.uid,(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.length>0){
			res.send({
				code:200,
				msg:'用户信息如下',
				data:result[0]
			});
			return;
		}else{
			res.send({
				code:301,
				msg:'该用户不存在！'
			});
		}
	});
});
router.post('/delete',(req,res)=>{
	//uid未提供，提示401，uid为空
	if(!req.body.uid){
		res.send({
			code:401,
			msg:'用户编号不能为空'
		});
		return;
	}
	//根据uid删除用户数据,delete返回为对象，affectedRows属性大于0说明删除用户成功,否则失败
	pool.query('delete from xz_user where uid=?',req.body.uid,(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.affectedRows>0){
			res.send({
				code:200,
				msg:'删除用户成功'
			});
			return;
		}else{
			res.send({
				code:301,
				msg:'删除失败，该用户不存在！'
			});
		}
	});
});
router.post('/update',(req,res)=>{
	//遍历请求对象，判断用户编号、邮箱、联系方式、性别、真实姓名是否为空，作出相应的响应
	//将msg定义为数组，用变量j控制打印出的信息****不能为空
	var arr1=['用户ID不能为空','邮箱地址不能为空','联系方式不能为空','性别信息不能为空','真实姓名不能为空'];
	var j=-1;
	var k=400;
	for(var b in req.body){
		k++;
		j++;
		//若单选按钮不选，下方遍历无法获取到单选按钮没选，故将单选按钮单独判断
		if(j==3){
			if(!req.body.gender){
				res.send({
					code:k,
					msg:`${arr1[j]}`
				});
				return;	
			}
		}
		if(!req.body[b]){
			if(b=='user_name')k++;
			res.send({
				code:k,
				msg:`${arr1[j]}`
			});
			return;
		}
	}
	//根据uid修改用户信息,update返回为对象，affectedRows属性大于0说明修改用户成功,否则失败
	pool.query('update xz_user set ? where uid=?',[req.body,req.body.uid],(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.affectedRows>0){
			res.send({
				code:200,
				msg:'修改用户信息成功'
			});
			return;
		}else{
			res.send({
				code:301,
				msg:'修改失败，该用户不存在！'
			});
		}
	});
});
//分页查询
router.get('/list',(req,res)=>{
	//用户未提供页码及每页显示的行数则按照默认值显示
	if(!req.query.pno) req.query.pno=1;
	if(!req.query.count) req.query.count=10;
	//req.query.count为字符串需转为整数
	let counts=parseInt(req.query.count);
	let start=(req.query.pno-1)*counts;
	pool.query('select * from xz_user limit ?,?',[start,counts],(err,result)=>{
		if(err) throw err;
		pool.query('select * from xz_user',(err,arr)=>{
			var total =arr.length;
			res.send({
				recordCount: total, 
    			pageSize:Math.ceil(total/counts), 
    			pageCount:counts, 
    			pno:Number(req.query.pno), 
    			data: result
			});
		});
		
	});
});
module.exports = router;