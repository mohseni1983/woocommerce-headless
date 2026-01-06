# راهنمای پاک کردن Git History از فایل‌های بزرگ

## مشکل شناسایی شده

تاریخچه Git شما شامل فایل‌های بسیار بزرگ است که نباید commit شده باشند:

- `site.tar.gz` - **309 MB** ❌
- `product/BUILD_ID` - **154 MB** ❌
- `archive.tar.bz2` - **104 MB** ❌
- `product/standalone/node_modules/` - فایل‌های زیادی ❌
- `product/dev/` - فایل‌های build ❌

**کل حجم Git**: 267 MB

## راه‌حل: پاک کردن فایل‌های بزرگ از تاریخچه

### روش 1: استفاده از git-filter-repo (توصیه می‌شود)

```bash
# نصب git-filter-repo (اگر نصب نشده)
pip install git-filter-repo

# پاک کردن فایل‌های بزرگ از تاریخچه
git filter-repo --path site.tar.gz --invert-paths
git filter-repo --path archive.tar.bz2 --invert-paths
git filter-repo --path product/ --invert-paths
```

### روش 2: استفاده از BFG Repo-Cleaner (سریع‌تر)

```bash
# دانلود BFG (از https://rtyley.github.io/bfg-repo-cleaner/)
# یا با Homebrew:
brew install bfg

# پاک کردن فایل‌های بزرگ
bfg --delete-files site.tar.gz
bfg --delete-files archive.tar.bz2
bfg --delete-folders product
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### روش 3: استفاده از git filter-branch (قدیمی اما کار می‌کند)

```bash
# پاک کردن فایل‌های خاص
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch site.tar.gz archive.tar.bz2" \
  --prune-empty --tag-name-filter cat -- --all

# پاک کردن پوشه product
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch product" \
  --prune-empty --tag-name-filter cat -- --all

# پاک کردن reflog و garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## بهبود .gitignore

قبل از پاک کردن، مطمئن شوید که `.gitignore` شامل این موارد است:

```gitignore
# Archives
*.tar.gz
*.tar.bz2
*.zip
*.rar

# Build outputs
product/
site/
*.BUILD_ID

# Dependencies
node_modules/
package-lock.json  # یا نگه دارید اگر می‌خواهید

# Next.js
.next/
out/
```

## بعد از پاک کردن

### 1. Force Push (⚠️ مراقب باشید!)

```bash
# اگر روی branch اصلی هستید
git push origin main --force

# یا اگر روی branch دیگری
git push origin <branch-name> --force
```

**⚠️ هشدار**: Force push تاریخچه را تغییر می‌دهد. اگر دیگران روی این repository کار می‌کنند، باید آنها را مطلع کنید.

### 2. بررسی حجم جدید

```bash
git count-objects -vH
du -sh .git
```

باید حجم بسیار کمتر شود (مثلاً کمتر از 10 MB).

## راه‌حل سریع (اگر repository جدید است)

اگر repository جدید است و می‌توانید از اول شروع کنید:

```bash
# ایجاد repository جدید
cd ..
git clone <your-repo-url> 30tel-clean
cd 30tel-clean

# حذف remote
git remote remove origin

# اضافه کردن فایل‌های جدید (بدون تاریخچه)
git checkout --orphan new-main
git add .
git commit -m "Initial commit - cleaned"

# اضافه کردن remote جدید
git remote add origin <your-repo-url>
git push -u origin new-main --force

# تغییر default branch به new-main
# (در GitHub/GitLab settings)
```

## جلوگیری از مشکل در آینده

1. ✅ همیشه `.gitignore` را قبل از commit اول بررسی کنید
2. ✅ از `git status` استفاده کنید قبل از `git add .`
3. ✅ فایل‌های بزرگ را به `.gitignore` اضافه کنید
4. ✅ از `git add` انتخابی استفاده کنید نه `git add .`

## دستورات مفید

```bash
# بررسی فایل‌های tracked
git ls-files | xargs du -h | sort -rh | head -20

# بررسی حجم Git
git count-objects -vH

# بررسی فایل‌های بزرگ در تاریخچه
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort -k2 -n -r | head -20
```

## نکات مهم

- ⚠️ قبل از force push، backup بگیرید
- ⚠️ اگر repository مشترک است، با تیم هماهنگ کنید
- ✅ بعد از پاک کردن، حجم باید به شدت کاهش یابد
- ✅ push بعدی باید سریع‌تر باشد



