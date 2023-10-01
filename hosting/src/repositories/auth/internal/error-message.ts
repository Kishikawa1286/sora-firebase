import { FirebaseError } from "@firebase/util";

export const handleSigninError = (e: FirebaseError) => {
  switch (e.code) {
    case "auth/email-already-in-use":
    case "auth/user-not-found":
    case "auth/user-mismatch":
    case "auth/wrong-password":
      return "メールアドレスまたはパスワードが違います";
    case "auth/user-disabled":
      return "サービスの利用が停止されています";
    case "auth/popup-blocked":
      return "認証ポップアップがブロックされました。ポップアップブロックをご利用の場合は設定を解除してください";
    case "auth/operation-not-supported-in-this-environment":
    case "auth/auth-domain-config-required":
    case "auth/operation-not-allowed":
    case "auth/unauthorized-domain":
      return "現在この認証方法はご利用頂けません";
    case "auth/requires-recent-login":
      return "認証の有効期限が切れています";
    default:
      return "認証に失敗しました。しばらく時間をおいて再度お試しください";
  }
};
