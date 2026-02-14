import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";



actor {
  // Secure user authentication and authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    name : Text;
    loginId : Text; // Mobile number or unique identifier from the frontend
  };

  // In-memory Maps for user profiles and submissions
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions (as in original code)
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

  // Submission type definition (now includes `selectedSTValue`)
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

  // Farmer submission management
  let submissions = Map.empty<Nat, FarmerSubmission>();

  // Add a farmer submission
  public shared ({ caller }) func addSubmission(submissionId : Nat, submission : FarmerSubmission) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add submissions");
    };
    submissions.add(submissionId, submission);
  };

  // Fetch a specific submission by ID
  public query ({ caller }) func getSubmission(submissionId : Nat) : async ?FarmerSubmission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    submissions.get(submissionId);
  };

  // Fetch all submissions as an array
  public query ({ caller }) func getAllSubmissions() : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    submissions.values().toArray();
  };

  // Fetch submissions by farmer ID
  public query ({ caller }) func getSubmissionsByFarmer(farmerId : Text) : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    let filteredIter = submissions.values().filter(
      func(submission) { submission.farmerId == farmerId }
    );
    filteredIter.toArray();
  };

  // Fetch submissions by device ID
  public query ({ caller }) func getSubmissionsByDevice(deviceId : Text) : async [FarmerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };
    let filteredIter = submissions.values().filter(
      func(submission) { submission.deviceId == deviceId }
    );
    filteredIter.toArray();
  };
};
