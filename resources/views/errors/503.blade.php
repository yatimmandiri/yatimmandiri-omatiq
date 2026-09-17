<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sedang Pemeliharaan - {{ $site_name ?? config('app.name') }}</title>
    <style>
        body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:linear-gradient(135deg,#134e45,#17524A,#258a7c);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;color:#fff}
        .card{max-width:480px;width:100%;background:#fff;color:#17524A;border-radius:32px;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.2)}
        .icon{width:64px;height:64px;background:#FFE600;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px}
        h1{margin:16px 0 8px;font-size:24px}
        p{color:#64748b;font-size:14px;line-height:1.6}
        .btn{display:block;margin-top:24px;background:#17524A;color:#fff;padding:12px;border-radius:12px;text-decoration:none;font-weight:600}
        .btn:hover{background:#134e45}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🛠️</div>
        <h1>Sedang Pemeliharaan</h1>
        <p>{{ $site_name ?? config('app.name') }} sedang dalam pemeliharaan. Akses situs ditutup sementara. Silakan kembali lagi nanti.</p>
        <a class="btn" href="javascript:window.location.reload()">Muat Ulang</a>
        <p style="margin-top:16px;font-size:12px;color:#94a3b8">Retry-After: 60 detik</p>
    </div>
</body>
</html>
