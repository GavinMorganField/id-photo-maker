from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import Optional
import numpy as np
from PIL import Image
import io
import rembg
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import base64
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def read_index():
    return FileResponse("static/index.html")
@app.get("/script.js")
async def read_script():
    return FileResponse("./static/script.js")
@app.get("/styles.css")
async def read_styles():
    return FileResponse("./static/styles.css")
@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    background_color: str = Form("white"),
    size: str = Form("1inch")
):
    try:
        logger.info(f"接收到的参数: background_color={background_color}, size={size}")
        if background_color == "white":
            logger.info("背景颜色为白色")
        elif background_color == "red":
            logger.info("背景颜色为红色")
        elif background_color == "blue":
            logger.info("背景颜色为蓝色")
        elif background_color == "transparent":
            logger.info("背景颜色为透明")
        else:
            logger.info(f"未知背景颜色: {background_color}")
        size = size.lower()
        if "x" in size:
            size_values = size.split("x")
            if len(size_values) == 2:
                target_width = int(float(size_values[0]) * 300)  
                target_height = int(float(size_values[1]) * 300)
                print(f"原始尺寸（像素）: {target_width} × {target_height}")
                print(f"转换为厘米: {target_width / 118.11:.2f} × {target_height / 118.11:.2f} cm")
        elif "inch" in size or "寸" in size:
            num_str = size.replace("inch", "").replace("寸", "")
            inch_value = float(num_str)
            target_width = int(inch_value * 300)  
            target_height = int(inch_value * 300)
            print(f"原始尺寸（像素）: {target_width} × {target_height}")
            print(f"转换为厘米: {target_width / 118.11:.2f} × {target_height / 118.11:.2f} cm")
        elif "cm" in size or "厘米" in size:
            num_str = size.replace("cm", "").replace("厘米", "")
            cm_values = num_str.split("x")
            if len(cm_values) == 2:
                target_width = int(float(cm_values[0]) * 118.11)  
                target_height = int(float(cm_values[1]) * 118.11)
                print(f"原始尺寸（厘米）: {cm_values[0]} × {cm_values[1]} cm")
                print(f"转换为像素: {target_width} × {target_height}")
            else:
                raise HTTPException(status_code=400, detail="无效的尺寸格式，请使用'长x宽'格式")
        else:
            raise HTTPException(status_code=400, detail="请使用'寸'或'厘米'作为尺寸单位")
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        logger.info("正在处理图片，可能需要一些时间...")
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        output = rembg.remove(img_byte_arr.getvalue())
        logger.info("图片处理完成")
        output = Image.open(io.BytesIO(output))
        if background_color == "transparent":
            bg = output
        else:
            if background_color == "white":
                bg_color = "#FFFFFF"
            elif background_color == "red":
                bg_color = "#D9001B"
            elif background_color == "blue":
                bg_color = "#02A7F0"
            else:
                bg_color = background_color 
            if isinstance(bg_color, str) and bg_color.startswith("#"):
                bg_color = bg_color.lstrip("#")
                bg_color = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
            bg = Image.new("RGB", output.size, bg_color)
            bg.paste(output, (0, 0), output)
            if isinstance(bg_color, str) and bg_color.startswith("#"):
                bg_color = bg_color.lstrip("#")
                bg_color = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
            bg = Image.new("RGB", output.size, bg_color)
        bg.paste(output, (0, 0), output)
        img = bg
        original_width, original_height = img.size
        target_width = min(target_width, original_width)
        target_height = min(target_height, original_height)
        target_width = max(1, target_width)
        target_height = max(1, target_height)
        bg = bg.resize((target_width, target_height))
        print(f"最终生成尺寸（像素）: {target_width} × {target_height}")
        print(f"最终生成尺寸（厘米）: {target_width / 118.11:.2f} × {target_height / 118.11:.2f} cm")
        buffered = io.BytesIO()
        bg.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        img_byte_arr = io.BytesIO()
        bg.save(img_byte_arr, format='PNG')
        img_str = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        return JSONResponse(content={"image": img_str, "width": target_width, "height": target_height})
    except Exception as e:
        logger.error(f"图片处理失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)