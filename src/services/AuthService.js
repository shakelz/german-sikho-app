import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider, reload, createUserWithEmailAndPassword, signOut } from '@react-native-firebase/auth';

export const signInWithGoogle = async () => {
  try {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '402725627104-s48i8mg8n2tcftrlf854ito5k24obr9o.apps.googleusercontent.com',
    });

    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign out from Google to force account picker to show
    // This ensures user can choose which account to use every time
    try {
      await GoogleSignin.signOut();
    } catch (signOutError) {
      // Ignore sign-out errors (user might not be signed in)
      console.log('GoogleSignin.signOut skipped (user not signed in)');
    }

    // Get the users ID token - this will show account picker
    const signInResult = await GoogleSignin.signIn();

    // Try to retrieve the idToken from the result
    // Note: The structure of signInResult changed in v13+ of the library
    let idToken = signInResult.data?.idToken || signInResult.idToken;

    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential (modular API)
    const userCredential = await signInWithCredential(getAuth(), googleCredential);
    return userCredential;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    await signOut(getAuth());
  } catch (error) {
    console.error('Sign Out Error:', error);
  }
};

export const signUp = async (email, password, name) => {
  try {
    console.log('🔵 Starting signUp process for:', email);

    // 1. Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
    const user = userCredential.user;
    console.log('✅ User created successfully:', user.uid);

    // 2. Update profile with display name
    await user.updateProfile({
      displayName: name,
    });
    console.log('✅ Profile updated with name:', name);

    // 3. Force language to English for better email delivery
    getAuth().languageCode = 'en';
    console.log('✅ Language set to: en');

    // 4. Send email verification with FORCED STANDARD WEB VERIFICATION
    // This avoids Dynamic Links issues
    try {
      console.log('🔵 Attempting to send verification email with standard web handler...');

      // Force simple web-based verification (NO Dynamic Links)
      const actionCodeSettings = {
        handleCodeInApp: false, // Do NOT try to open the app, use browser
        url: 'https://germansikho.firebaseapp.com/__/auth/action' // Standard Firebase handler
      };

      await user.sendEmailVerification(actionCodeSettings);
      console.log('✅ Verification email sent successfully to:', user.email);
      console.log('✅ Email should arrive within 1-2 minutes');
      console.log('📧 Check spam/junk folder if not visible in inbox');
    } catch (emailError) {
      console.error('❌ Email verification failed!');
      console.error('❌ Error Code:', emailError.code);
      console.error('❌ Error Message:', emailError.message);
      console.error('❌ Full Error:', JSON.stringify(emailError, null, 2));

      // Log specific error types
      if (emailError.code === 'auth/too-many-requests') {
        console.error('⚠️ Too many verification emails sent. Wait 5-10 minutes and try again.');
      } else if (emailError.code === 'auth/network-request-failed') {
        console.error('⚠️ Network issue. Check your internet connection.');
      } else if (emailError.code === 'auth/invalid-email') {
        console.error('⚠️ Email format is invalid.');
      }

      throw new Error(`Failed to send verification email: ${emailError.message}`);
    }

    return user;
  } catch (error) {
    console.error('❌ SignUp Error:', error.code, error.message);
    throw error;
  }
};

export const sendVerificationEmail = async (user) => {
  try {
    console.log('🔵 Attempting to resend verification email to:', user.email);

    // Force language to English
    getAuth().languageCode = 'en';

    // Reload user to get latest state (modular API)
    await reload(user);
    console.log('✅ User data reloaded');

    // Check if already verified
    if (user.emailVerified) {
      console.log('✅ Email already verified! No need to send again.');
      return;
    }

    // Send verification email with FORCED STANDARD WEB VERIFICATION
    try {
      console.log('🔵 Sending verification email with standard web handler...');

      // Force simple web-based verification (NO Dynamic Links)
      const actionCodeSettings = {
        handleCodeInApp: false, // Do NOT try to open the app, use browser
        url: 'https://germansikho.firebaseapp.com/__/auth/action' // Standard Firebase handler
      };

      await user.sendEmailVerification(actionCodeSettings);
      console.log('✅ Verification email sent successfully to:', user.email);
      console.log('✅ Email should arrive within 1-2 minutes');
      console.log('📧 Check spam/junk folder if not visible in inbox');
    } catch (emailError) {
      console.error('❌ Error sending verification email!');
      console.error('❌ Error Code:', emailError.code);
      console.error('❌ Error Message:', emailError.message);
      console.error('❌ Full Error:', JSON.stringify(emailError, null, 2));

      // Log specific error types
      if (emailError.code === 'auth/too-many-requests') {
        console.error('⚠️ Too many verification emails sent. Wait 5-10 minutes and try again.');
        throw new Error('Too many requests. Please wait 5-10 minutes before trying again.');
      } else if (emailError.code === 'auth/network-request-failed') {
        console.error('⚠️ Network issue. Check your internet connection.');
        throw new Error('Network error. Please check your internet connection.');
      }

      throw emailError;
    }
  } catch (error) {
    console.error('❌ sendVerificationEmail failed:', error);
    throw error;
  }
};

export const checkEmailVerified = async (user) => {
  try {
    await reload(user);
    console.log('🔵 Email verified status for', user.email, ':', user.emailVerified);
    return user.emailVerified;
  } catch (error) {
    console.error('❌ Error checking email verification:', error);
    throw error;
  }
};
