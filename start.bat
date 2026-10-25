@echo off
chcp 936 >nul 2>nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "ROOT=%CD%"
set "PY=%ROOT%\.venv\Scripts\python.exe"
set "PYTHONIOENCODING=gbk"

echo ================================================
echo   辰光 Agent 平台 - 一键启动
echo   数据库: SQLite    缓存: fakeredis  (无需 Docker)
echo   存储: mock_minio (内存模拟)
echo ================================================
echo.

REM ==================== 1. Python 检测 ====================
echo [1/5] 检查 Python 环境 ...
set "SYS_PY="
where python >nul 2>&1
if not errorlevel 1 (
    set "SYS_PY=python"
) else (
    where py >nul 2>&1
    if not errorlevel 1 set "SYS_PY=py -3"
)

if not defined SYS_PY (
    if exist "D:\Python\python.exe" set "SYS_PY=D:\Python\python.exe"
)

if not defined SYS_PY (
    echo.
    echo [错误] 未检测到 Python，请安装 Python 3.10 或更高版本。
    echo        安装时请勾选 "Add Python to PATH"。
    echo.
    pause
    exit /b 1
)

echo       检测到 Python: !SYS_PY!

if not exist "%PY%" (
    echo       首次启动，正在创建虚拟环境 .venv ...
    "%SYS_PY%" -m venv .venv
    if errorlevel 1 (
        echo.
        echo [错误] 虚拟环境创建失败，请确认 Python 安装正常。
        pause
        exit /b 1
    )
    echo       虚拟环境创建完成
) else (
    echo       虚拟环境已存在
)

REM ==================== 2. 安装依赖 ====================
echo [2/5] 检查并安装依赖 ...
"%PY%" -c "import fastapi, uvicorn, aiosqlite, fakeredis, alembic, sqlalchemy, minio" >nul 2>&1
if errorlevel 1 (
    echo       正在安装缺失的依赖包（可能需要几分钟）...
    "%PY%" -m pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败。请检查网络连接或手动运行：
        echo        pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
        echo.
        pause
        exit /b 1
    )
    echo       依赖安装完成
) else (
    echo       依赖库完整
)

REM ==================== 3. 初始化数据库 ====================
echo [3/5] 准备数据库 ...
"%PY%" bootstrap_db.py
if errorlevel 1 (
    echo.
    echo [警告] 数据库初始化失败，请查看 logs/backend.log 了解详情。
    pause
    exit /b 1
)
echo       数据库准备完成

REM ==================== 4. 前端准备 ====================
echo [4/5] 检查前端依赖 ...
if not exist "%ROOT%\app\node_modules" (
    echo       首次启动，正在安装 npm 依赖，请稍候 ...
    pushd "%ROOT%\app"
    call npm.cmd install
    popd
    if errorlevel 1 (
        echo.
        echo [错误] npm 依赖安装失败，请确认已安装 Node.js 18+。
        pause
        exit /b 1
    )
) else (
    echo       前端依赖已就绪
)

REM ==================== 5. 启动服务 ====================
echo [5/5] 启动服务 ...

call :port_busy 8080
if "!BUSY!"=="1" (
    echo       [警告] 端口 8080 已被占用，请检查是否有其他服务在运行。
) else (
    start "辰光Agent-后端 8080" cmd /k "cd /d ""%ROOT%"" && ""%PY%"" -m uvicorn src.main:app --host 127.0.0.1 --port 8080"
    echo       后端服务启动中 ...
)

call :port_busy 5173
if "!BUSY!"=="1" (
    echo       [警告] 端口 5173 已被占用，请检查是否有其他服务在运行。
) else (
    start "辰光Agent-前端 5173" cmd /k "cd /d ""%ROOT%\app"" && npm.cmd run dev"
    echo       前端服务启动中 ...
)

echo.
echo       等待服务就绪 ...
"%PY%" wait_ready.py 120
set "READY=!ERRORLEVEL!"

echo.
echo ================================================
echo   后端 API 文档: http://localhost:8080/docs
echo   健康检查:      http://localhost:8080/health
echo   前端页面:      http://localhost:5173
echo   默认账号:      admin / 123456
echo.
if "!READY!"=="0" (
    echo   服务启动成功，正在打开浏览器 ...
    start "" "http://localhost:5173"
) else (
    echo   部分服务未能正常启动，请查看 logs/backend.log 和 logs/frontend.log 排查。
)
echo.
echo   停止服务：直接关闭对应的命令行窗口即可
echo ================================================
echo.
pause
exit /b 0

REM ==================== 子程序：端口占用检测 ====================
:port_busy
set "BUSY=0"
netstat -ano | findstr /R /C:":%%~1 .*LISTENING" >nul 2>&1
if not errorlevel 1 set "BUSY=1"
exit /b 0