const express=require('express');
//导入连接池
const pool = require("../pool.js");
//创建路由器
const router=express.Router();
//添加商品
router.post('/add',(req,res)=>{
    //遍历请求对象，判断所填内容否为空，并作出相应的响应
    //将msg定义为数组，用变量i控制打印出的信息****不能为空
    var arr=['所属家族编号不能为空','主标题不能为空','副标题不能为空','商品价格不能为空','服务承诺不能为空','规格颜色不能为空','商品名称不能为空','操作系统不能为空','内存容量不能为空','分辨率不能为空','显卡型号不能为空','处理器不能为空','显存容量不能为空','所属分类不能为空','硬盘容量类型不能为空','产品详细说明不能为空','上架时间不能为空','已售出的数量不能为空',];
    var i=-1;
    var j=400;
    for(var k in req.body){
        i++;
        j++;
        if(!req.body[k]){
            res.send({
				code:j,
				msg:`${arr[i]}`
			});
			return;
        }
    }
	//若单选按钮不选，上述遍历无法获取到单选按钮没选，故将单选按钮单独判断
	if(!req.body.isonsale){
		res.send({
			code:'419',
			msg:'是否在售不能为空'
		});
		return;
	}
    pool.query('insert into xz_laptop set ?',req.body,(err,result)=>{
        if(err){
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
        if(result.affectedRows>0){
            res.send({
                code:200,
                msg:'add sucess'});
        }else{
            res.send({
                code:301,
                msg:'add fail'});
        }
    });
});
//分页查询
router.get('/list',(req,res)=>{
	//用户未提供页码及每页显示的行数则按照默认值显示
    if(!req.query.pno) req.query.pno=1;
	if(!req.query.count) req.query.count=10; 
    //req.query.count为字符串需转为整数
    var counts=parseInt(req.query.count);
    var start=(req.query.pno-1)*counts;
    pool.query('select lid,title,price,sold_count,is_onsale,md as pic from xz_laptop left join xz_laptop_pic on lid=laptop_id limit ?,?',[start,counts],(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
		}else{
			pool.query('select * from xz_laptop',(err,dataArr)=>{
				var total=dataArr.length;
				res.send({
					recordCount: total, 
					pageSize: Math.ceil(total/counts), 
					pageCount: counts, 
					pno: Number(req.query.pno), 
					data:result
				});
			});
		}
	});
});
//商品详情
//根据lid显示服务器数据,select结果为数组，数组长度大于0说明商品存在,按照要求返回相应信息，否则不存在
router.post('/detail',(req,res)=>{
    //lid未提供，提示401，lid为空
	if(!req.body.lid){
		res.send({
			code:401,
			msg:'商品编号不能为空'
		});
		return;
	}
	//查询要查询的商品编号的所有笔记本信息及图片信息及所属家族信息，查询的商品编号对应的图片信息大于1条，故显示结果不符合要求，需对显示结果进行处理
	pool.query('select * from xz_laptop left join xz_laptop_pic on lid=laptop_id left join xz_laptop_family on family_id=fid where lid=?',req.body.lid,(err,result)=>{
		if(result.length>0){
			//对显示结果进行处理，picList用于保存显示结果中所有图片信息
			var picList=[];
			//对显示结果进行处理，detailList用于保存显示结果中所有笔记本信息，这个是唯一的，所以只取显示结果第一条的部分属性
			var detailList={
				lid:result[0].lid,
				family_id:result[0].family_id,              
				title:result[0].title,         
				subtitle:result[0].subtitle,      
				price:result[0].price,        
				promise:result[0].promise,       
				spec:result[0].spec,           
				lname:result[0].lname,          
				os:result[0].os,             
				memory:result[0].memory,         
				resolution:result[0].resolution,     
				video_card:result[0].video_card,     
				cpu:result[0].cpu,            
				video_memory:result[0].video_memory,   
				category:result[0].category,       
				disk:result[0].disk,           
				details:result[0].details,      
				shelf_time:result[0].shelf_time,          
				sold_count:result[0].sold_count,             
				is_onsale:result[0].is_onsale           
			};
			//图片信息大于1条，将显示结果的每一条的图片信息放入picList中
			for(var i=0;i<result.length;i++){
				picList.push({
					pid:result[i].pid,
					laptop_id:result[i].laptop_id,
					sm:result[i].sm,
					md:result[i].md,
					lg:result[i].lg
				});
			}
			//查询所属家族中所有笔记本lid,spec的信息
			pool.query('select lid,spec from xz_laptop where family_id=?',result[0].family_id,(err,laptopData)=>{
				if(err) throw err;
				res.send({
					code:200,
					details:detailList,
					picList:picList,
					family:{
						fid:result[0].fid,
						fname:result[0].fname,
						laptopList:laptopData
					}
				});
			});
		}else{
			res.send({
				code:301,
				msg:'该商品不存在！'
			});
		}
	});
	//根据lid显示服务器数据,select结果为数组，数组长度大于0说明商品存在,按照要求返回相应信息，否则不存在
	/*
	pool.query('select * from xz_laptop where lid=?',req.body.lid,(err,result)=>{
		if(err) {
			res.send({
				code:500,
				msg:'服务器正忙，请稍后再试'
			});
			return;
		}
		if(result.length>0){
			//picList用于保存用户要查询的商品编号的商品的图片信息
			var picList;
			//查询用户要查询的商品编号的笔记本电脑图片
			pool.query('select * from xz_laptop_pic where laptop_id=?',req.body.lid,(err,picData)=>{
				if(err) throw err;
				picList=picData;
			});
			//查询用户要查询的商品编号的笔记本所属家族的名称
			pool.query('select fname from  xz_laptop_family where fid = ?',result[0].family_id,(err,fnameData)=>{
				if(err) throw err;
				//查询用户要查询的商品编号的笔记本所属家族里的所有笔记本的编号和规格
				pool.query('select lid,spec from xz_laptop where family_id=?',result[0].family_id,(err,laptopData)=>{
					if(err) throw err;
					res.send({
						code:200,
						details:result[0],
						picList:picList,
						family:{
							fid:result[0].family_id,
							fname:fnameData[0].fname,
							laptopList:laptopData
						}
					});
					return;
				});
			});
		}else{
			res.send({
				code:301,
				msg:'该商品不存在！'
			});
		}
	});
	*/
});
router.get('/delete',(req,res)=>{
    //lid未提供，提示401，lid为空
	if(!req.query.lid){
		res.send({
			code:401,
			msg:'商品编号不能为空'
		});
		return;
	}
    pool.query('delete from xz_laptop where lid=?',req.query.lid,(err,result)=>{
        if(err) throw err;
		//根据lid删除相应数据,delete返回为对象，affectedRows属性大于0说明删除商品成功,否则失败
        if(result.affectedRows>0){
            res.send({
                code:200,
                msg:`删除id为${req.query.lid}的商品成功`
            });
        }else{
            res.send({
                code:301,
                msg:'删除失败，该商品不存在！'
            });  
        }
    });
});

module.exports=router;