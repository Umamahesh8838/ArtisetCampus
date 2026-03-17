with open("src/pages/Register.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_content = """          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
              <div className="space-y-4">
                
                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[13px] font-medium text-foreground">First Name</label>
                    <Input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="John"
                      className="h-10 text-sm"
                      disabled={emailOtpSent}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[13px] font-medium text-foreground">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="h-10 text-sm"
                      disabled={emailOtpSent}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  {!emailOtpVerified ? (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-10 text-sm flex-1"
                        disabled={emailOtpSent}
                      />
                      <Button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={sendingEmailOtp || emailResendTimer > 0}
                        className="h-10 px-4 whitespace-nowrap text-sm"
                        variant={emailOtpSent ? "outline" : "default"}
                      >
                        {sendingEmailOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : emailResendTimer > 0 ? (
                          `${emailResendTimer}s`
                        ) : emailOtpSent ? (
                          "Resend"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                      <span className="text-sm text-foreground/80">{email}</span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    </div>
                  )}

                  {emailOtpSent && !emailOtpVerified && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex-1 flex justify-center gap-1.5" onPaste={createOtpPasteHandler("email")}>
                          {emailOtp.map((digit, i) => (
                            <input
                              key={`email-${i}`}
                              ref={el => { emailInputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => createOtpChangeHandler("email")(i, e.target.value)}
                              onKeyDown={e => createOtpKeyDownHandler("email")(i, e)}
                              className="w-8 h-10 rounded-md border border-input bg-background justify-center text-center text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={verifyingEmailOtp || emailOtp.join("").length < OTP_LENGTH}
                          className="h-10 px-3 text-xs"
                          variant="secondary"
                        >
                          {verifyingEmailOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone (Unlocks after Email) */}
                <div className={`space-y-1 transition-all duration-300 ${emailOtpVerified ? 'opacity-100 h-auto' : 'opacity-40 pointer-events-none'}`}>
                  <label className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  {!phoneOtpVerified ? (
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        placeholder="9876543210"
                        className="h-10 text-sm flex-1"
                        disabled={phoneOtpSent || !emailOtpVerified}
                      />
                      <Button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={sendingPhoneOtp || phoneResendTimer > 0 || !emailOtpVerified}
                        className="h-10 px-4 whitespace-nowrap text-sm"
                        variant={phoneOtpSent ? "outline" : "default"}
                      >
                        {sendingPhoneOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : phoneResendTimer > 0 ? (
                          `${phoneResendTimer}s`
                        ) : phoneOtpSent ? (
                          "Resend"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                      <span className="text-sm text-foreground/80">{contactNumber}</span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    </div>
                  )}

                  {phoneOtpSent && !phoneOtpVerified && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex-1 flex justify-center gap-1.5" onPaste={createOtpPasteHandler("phone")}>
                          {phoneOtp.map((digit, i) => (
                            <input
                              key={`phone-${i}`}
                              ref={el => { phoneInputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => createOtpChangeHandler("phone")(i, e.target.value)}
                              onKeyDown={e => createOtpKeyDownHandler("phone")(i, e)}
                              className="w-8 h-10 rounded-md border border-input bg-background font-bold justify-center text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={handleVerifyPhoneOtp}
                          disabled={verifyingPhoneOtp || phoneOtp.join("").length < OTP_LENGTH}
                          className="h-10 px-3 text-xs"
                          variant="secondary"
                        >
                          {verifyingPhoneOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password (Unlocks after Phone) */}
                {phoneOtpVerified && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[13px] font-medium text-foreground">Password</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-medium text-foreground">Confirm</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-3 animate-in fade-in slide-in-from-bottom-2">
                  <Button
                    type="button"
                    onClick={handleSignup}
                    className="w-full h-11 font-semibold text-base"
                    disabled={!emailOtpVerified || !phoneOtpVerified || signingUp}
                  >
                    {signingUp ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
"""

lines = lines[:295] + [new_content] + lines[534:]
with open("src/pages/Register.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
