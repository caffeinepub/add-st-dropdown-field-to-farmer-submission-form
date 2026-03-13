import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Secure user authentication and authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    name : Text;
    loginId : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type FarmerSubmission = {
    fieldSize : Text;
    deviceId : Text;
    farmerId : Text;
    location : Text;
    fieldCoordinates : Text;
    redeemedNFTId : Text;
    selectedSTValue : Text;
    state : Text;
    fieldImagePath : Text;
    previousCrop : Text;
    responses : Text;
    currentCrop : Text;
    claimedSTMileage : ?Nat;
    reqCount : ?Nat;
    oldRandomArray : ?[Nat];
    nftIdAdjustedBooleansArray : ?[Bool];
    oldRandomArrayBooleansArray : ?[Bool];
    responsesArray : ?[Text];
    fieldCoordinatesList : ?[Text];
    nftId : Text;
    reviewCompleted : Bool;
    adminReviewStatus : Text;
    pictureId : Text;
  };

  public type LeaderboardEntry = {
    name : Text;
    loginId : Text;
    totalSTMileage : Nat;
    entryCount : Nat;
    rank : Nat;
  };

  let submissions = Map.empty<Nat, FarmerSubmission>();

  public shared ({ caller }) func addSubmission(submissionId : Nat, submission : FarmerSubmission) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add submissions");
    };
    submissions.add(submissionId, submission);
  };

  public query ({ caller }) func getSubmission(submissionId : Nat) : async ?FarmerSubmission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    submissions.get(submissionId);
  };

  public query ({ caller }) func getAllSubmissions() : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    submissions.values().toArray();
  };

  public query ({ caller }) func getSubmissionsByFarmer(farmerId : Text) : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    let filteredIter = submissions.values().filter(
      func(submission) { submission.farmerId == farmerId }
    );
    filteredIter.toArray();
  };

  public query ({ caller }) func getSubmissionsByDevice(deviceId : Text) : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    let filteredIter = submissions.values().filter(
      func(submission) { submission.deviceId == deviceId }
    );
    filteredIter.toArray();
  };

  public query ({}) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Fetch leaderboard JSON from the locked Google Apps Script endpoint.
  // Returns raw JSON string: {"totalSubmissions":N,"leaderboard":[{"loginID":"...","submissions":N}]}
  public shared func getLeaderboard() : async Text {
    await OutCall.httpGetRequest(
      "https://script.google.com/macros/s/AKfycbzCSJqngZ4pXEcgsnQHN-xsQR14OKTUvg4CBzjcAOesV93MFdC74NPXm_EkiZ5pu_5R/exec",
      [],
      transform,
    );
  };
};
