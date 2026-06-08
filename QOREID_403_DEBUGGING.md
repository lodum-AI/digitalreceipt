# Debugging "Forbidden resource" Error from QoreID

## The Problem

When you try to verify a NIN, you get:
```
Error: Forbidden resource
```

This is a **403 Forbidden** response from QoreID API, NOT a Supabase issue.

---

## Debugging Steps

### **Step 1: Check the Status Page**
Visit `/status` page on your Vercel deployment:
```
https://your-domain.com/status
```

**Look for QoreID section:**
- ✅ Connected → Credentials are correct for auth
- ❌ Not Connected → Credentials are wrong or expired

**If QoreID shows ✅ Connected but NIN still fails:**
- Problem is NOT the credentials
- Problem is something else (see Step 2)

---

### **Step 2: Check What's Being Sent to QoreID**

The NIN verification sends a POST request with:
```json
{
  "firstname": "John",      // optional
  "lastname": "Doe",        // optional
  "dob": "1990-01-15",      // optional (YYYY-MM-DD format)
  "phone": "08012345678",   // optional
  "gender": "M"             // optional (M/F)
}
```

**Common Issues:**
1. ❌ **Wrong date format** → Use `YYYY-MM-DD`
2. ❌ **Invalid phone format** → Use `08012345678` (Nigerian format)
3. ❌ **Gender wrong** → Must be `M` or `F`
4. ❌ **Special characters in names** → Remove accents/special chars

---

### **Step 3: Check QoreID Credentials**

Even if `/status` shows ✅ Connected, the actual NIN lookup might still fail.

**Verify your QoreID credentials:**
1. Go to https://qoreid.com
2. Log in to your account
3. Check API Settings/Credentials:
   - Is your `Client ID` correct?
   - Is your `Secret` correct?
   - Are they for the right environment (dev vs production)?

**Common QoreID Issues:**

| Error | Cause | Fix |
|-------|-------|-----|
| **403 Forbidden** | IP not whitelisted | Contact QoreID support to whitelist your IP |
| **403 Forbidden** | Account suspended | Check QoreID dashboard for warnings |
| **403 Forbidden** | API quota exceeded | Upgrade your QoreID plan |
| **403 Forbidden** | Credentials expired | Get new credentials from QoreID |
| **403 Forbidden** | Testing credentials on production | Use production credentials |

---

### **Step 4: Check If It's a Test NIN**

QoreID has **test NIns** that work in development:

Try using a test NIN:
```
12345678901  (generic test)
```

If this works → Your real NIN might be:
- Invalid format
- Not in the NIMC database
- Requires additional verification

If this fails → Your credentials are definitely wrong

---

### **Step 5: Check Your Vercel Logs**

Go to **Vercel Dashboard → Your Project → Deployments → Latest → Logs**

Look for POST requests to `/api/nin`:
```
POST /api/nin 200 OK
```

If you see **500 error**, check the error message in logs.

---

## Common Causes & Solutions

### **Cause 1: IP Whitelisting**
QoreID may require you to whitelist your Vercel IP addresses.

**Solution:**
1. Go to QoreID dashboard
2. Find "IP Whitelist" or "Security Settings"
3. Add your Vercel deployment IP
4. Or disable IP filtering if testing

**Your Vercel IP:**
- Check Vercel logs to see incoming request IP
- Or ask QoreID support for IP requirements

### **Cause 2: Credentials Not Saved Correctly**

**Solution:**
1. Delete the old env vars from Vercel
2. Get fresh credentials from QoreID
3. Add them as NEW env vars
4. Redeploy
5. Test again

### **Cause 3: Wrong Credentials Type**

QoreID has different credential types:
- **Sandbox/Test** credentials (for development)
- **Production** credentials (for live users)

**Make sure you're using the right ones.**

If you're testing on Vercel (production), use **Production credentials** from QoreID.

### **Cause 4: API Limit Exceeded**

QoreID has rate limits. If you've made many test requests:
- Wait 1 hour
- Or upgrade your QoreID plan
- Or contact QoreID support

### **Cause 5: NIN Actually Invalid**

If your test NIN doesn't exist in NIMC database:
- Try a different NIN
- Or check that the NIN is correct
- Contact NIMC to verify the NIN

---

## Testing with cURL

You can test the NIN API directly:

```bash
# Test if your endpoint is working
curl -X POST https://your-domain.com/api/nin \
  -H "Content-Type: application/json" \
  -d '{"nin": "12345678901"}'
```

Expected responses:

**Success (200):**
```json
{
  "person": {
    "nin": "12345678901",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

**QoreID 403 Error (502 from your API):**
```json
{
  "error": "NIN service error: QoreID auth failed (403): ..."
}
```

**Missing Credentials (503):**
```json
{
  "error": "NIN_NOT_CONFIGURED"
}
```

---

## Step-by-Step Verification Checklist

- [ ] **Status page shows QoreID ✅ Connected?**
  - No → Credentials are wrong, update them
  - Yes → Continue to next step

- [ ] **Using test NIN (12345678901)?**
  - No → Try with a test NIN first
  - Yes → Continue to next step

- [ ] **Correct NIN format?**
  - Check: Is it 11 digits? (e.g., `12345678901`)
  - Yes → Continue to next step

- [ ] **Added optional fields correctly?**
  - Check firstname/lastname format (no special chars)
  - Check dob format (YYYY-MM-DD)
  - Check phone format (Nigerian format 08XXXXXXXXX)
  - Yes → Continue to next step

- [ ] **Vercel logs show 502 error?**
  - Yes → Check the error message in logs
  - No → App is crashing somewhere else

- [ ] **QoreID dashboard shows usage?**
  - Yes → Your requests are reaching QoreID
  - No → Credentials might be for different account

---

## Contact QoreID Support

If you've checked everything and it still fails:

1. Go to https://qoreid.com/support
2. Submit a ticket with:
   - Your Client ID
   - Error message: "403 Forbidden"
   - The NIN you're testing with
   - Your Vercel domain
3. Ask them to:
   - Verify your credentials are active
   - Check if your IP needs whitelisting
   - Confirm API limits

---

## Key Difference: Supabase vs QoreID

| Issue | Where It Happens | Status Page Shows |
|-------|------------------|-------------------|
| **Supabase auth wrong** | Can't connect to database | Supabase ❌ Not Connected |
| **QoreID credentials wrong** | NIN verification fails | QoreID ❌ Not Connected |
| **QoreID API limit** | 403 Forbidden on every request | QoreID ✅ Connected (but requests fail) |
| **QoreID IP whitelist** | 403 Forbidden from specific IP | QoreID ✅ Connected (but requests fail) |

**Note:** You can have QoreID showing ✅ Connected but NIN verification still failing if the issue is:
- IP whitelisting
- API quota
- Rate limiting
- Invalid test NIN

---

## Quick Fix Summary

1. **Check `/status` page** → Is QoreID showing ✅ or ❌?
2. **If ❌** → Update credentials in Vercel and redeploy
3. **If ✅** → Problem is with QoreID API limits/IP/quota
   - Try a test NIN
   - Check Vercel logs
   - Contact QoreID support

---

## Still Stuck?

1. **Share error message** from `/api/nin` response
2. **Check `/status` page** for QoreID status
3. **Look at Vercel logs** for the full error
4. **Contact QoreID support** with your Client ID
5. **Email digitalreceipt support** with the error details

