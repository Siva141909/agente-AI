# Fix PyTorch DLL Error on Windows

## Problem
```
OSError: [WinError 1114] A dynamic link library (DLL) initialization routine failed. 
Error loading "C:\Users\rasiv\anaconda3\Lib\site-packages\torch\lib\c10.dll"
```

This is a common Windows issue with PyTorch.

## Solutions (Try in Order)

### Solution 1: Reinstall PyTorch (CPU Version - Recommended)

Uninstall and reinstall PyTorch with CPU-only version (lighter, more stable):

```bash
# Uninstall current PyTorch
pip uninstall torch torchvision torchaudio

# Install CPU-only version (much smaller, no DLL issues)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

Then reinstall other requirements:
```bash
pip install -r transaction_parser_requirements.txt
```

### Solution 2: Install Visual C++ Redistributables

PyTorch requires Visual C++ Redistributables. Download and install:
- **Visual C++ Redistributable 2015-2022**: https://aka.ms/vs/17/release/vc_redist.x64.exe

After installing, restart your terminal and try again.

### Solution 3: Use Conda Instead of Pip

If you're using Anaconda, try installing via conda:

```bash
conda install pytorch torchvision torchaudio cpuonly -c pytorch
```

### Solution 4: Use Hugging Face Inference API (No Local PyTorch Needed!)

**This is the easiest solution** - use Hugging Face's cloud API instead of running models locally:

1. Update `transaction_parser.py` to use Inference API
2. No PyTorch installation needed
3. Faster startup, no DLL issues
4. Uses your Hugging Face token

I can create a version that uses the Inference API if you prefer this approach.

### Solution 5: Clean Reinstall

If nothing works, do a complete clean reinstall:

```bash
# Remove PyTorch completely
pip uninstall torch torchvision torchaudio transformers accelerate

# Clear pip cache
pip cache purge

# Reinstall everything fresh
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r transaction_parser_requirements.txt
```

## Quick Test

After fixing, test if PyTorch works:

```python
python -c "import torch; print('PyTorch version:', torch.__version__); print('CPU available:', torch.cuda.is_available())"
```

If this works, then try running the server again:
```bash
python simple_api_server.py
```

## Recommended: Use Inference API Instead

Since you're having DLL issues, I recommend using Hugging Face Inference API. It:
- ✅ No PyTorch installation needed
- ✅ No DLL errors
- ✅ Faster (models run on Hugging Face servers)
- ✅ Uses your free token
- ✅ Same functionality

Would you like me to create an Inference API version?

