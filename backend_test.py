import requests
import sys
import json
from datetime import datetime, timedelta

class TurfBookingAPITester:
    def __init__(self, base_url="https://pitch-book-6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_booking_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, cookies=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@example.com", "password": "admin123"}
        )
        if success and '_id' in response:
            self.admin_token = response.get('_id')
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"name": "Test User", "email": test_email, "password": "testpass123"}
        )
        if success and '_id' in response:
            self.test_user_id = response['_id']
            return True, test_email
        return False, None

    def test_user_login(self, email):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": "testpass123"}
        )
        return success

    def test_get_user_profile(self):
        """Test get current user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_logout(self):
        """Test logout"""
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

    def test_get_all_turfs(self):
        """Test get all turfs"""
        success, response = self.run_test(
            "Get All Turfs",
            "GET",
            "turfs",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} turfs")
            return True, response[0]['id'] if response else None
        return False, None

    def test_get_turf_by_id(self, turf_id):
        """Test get specific turf"""
        success, response = self.run_test(
            "Get Turf by ID",
            "GET",
            f"turfs/{turf_id}",
            200
        )
        return success

    def test_get_turf_slots(self, turf_id):
        """Test get available slots for a turf"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        success, response = self.run_test(
            "Get Turf Slots",
            "GET",
            f"turfs/{turf_id}/slots?date={tomorrow}",
            200
        )
        if success and 'slots' in response:
            available_slots = [slot for slot in response['slots'] if slot['available']]
            print(f"   Found {len(available_slots)} available slots")
            return True, available_slots[0]['time'] if available_slots else None
        return False, None

    def test_search_turfs(self):
        """Test search turfs with filters"""
        # Test sport filter
        success1, _ = self.run_test(
            "Search Turfs by Sport",
            "GET",
            "turfs?sport=football",
            200
        )
        
        # Test city filter
        success2, _ = self.run_test(
            "Search Turfs by City",
            "GET",
            "turfs?city=Mumbai",
            200
        )
        
        # Test search query
        success3, _ = self.run_test(
            "Search Turfs by Query",
            "GET",
            "turfs?search=Champions",
            200
        )
        
        return success1 and success2 and success3

    def test_create_booking(self, turf_id, time_slot):
        """Test create booking"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data={
                "turf_id": turf_id,
                "date": tomorrow,
                "time_slot": time_slot,
                "duration": 1
            }
        )
        if success and 'id' in response:
            self.test_booking_id = response['id']
            return True
        return False

    def test_get_my_bookings(self):
        """Test get user's bookings"""
        success, response = self.run_test(
            "Get My Bookings",
            "GET",
            "bookings/my",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} bookings")
            return True
        return False

    def test_cancel_booking(self):
        """Test cancel booking"""
        if not self.test_booking_id:
            print("❌ No booking ID available for cancellation test")
            return False
            
        success, response = self.run_test(
            "Cancel Booking",
            "PATCH",
            f"bookings/{self.test_booking_id}/cancel",
            200
        )
        return success

    def test_auth_protected_endpoints(self):
        """Test that protected endpoints require authentication"""
        # Clear session cookies to test unauthorized access
        self.session.cookies.clear()
        
        success1, _ = self.run_test(
            "Protected Endpoint - My Bookings (Unauthorized)",
            "GET",
            "bookings/my",
            401
        )
        
        success2, _ = self.run_test(
            "Protected Endpoint - Create Booking (Unauthorized)",
            "POST",
            "bookings",
            401,
            data={"turf_id": "turf-001", "date": "2026-04-15", "time_slot": "10:00", "duration": 1}
        )
        
        return success1 and success2

def main():
    print("🚀 Starting TurfBook API Testing...")
    print("=" * 50)
    
    tester = TurfBookingAPITester()
    
    # Test 1: Get all turfs (public endpoint)
    success, turf_id = tester.test_get_all_turfs()
    if not success or not turf_id:
        print("❌ Failed to get turfs, stopping tests")
        return 1

    # Test 2: Get specific turf
    if not tester.test_get_turf_by_id(turf_id):
        print("❌ Failed to get turf details")

    # Test 3: Get turf slots
    success, available_slot = tester.test_get_turf_slots(turf_id)
    if not success:
        print("❌ Failed to get turf slots")

    # Test 4: Search functionality
    if not tester.test_search_turfs():
        print("❌ Search functionality failed")

    # Test 5: Test protected endpoints without auth
    if not tester.test_auth_protected_endpoints():
        print("❌ Auth protection test failed")

    # Test 6: User registration
    reg_success, test_email = tester.test_user_registration()
    if not reg_success or not test_email:
        print("❌ User registration failed, stopping auth tests")
        return 1

    # Test 7: User login
    if not tester.test_user_login(test_email):
        print("❌ User login failed")
        return 1

    # Test 8: Get user profile
    if not tester.test_get_user_profile():
        print("❌ Get user profile failed")

    # Test 9: Create booking (requires auth)
    if available_slot and not tester.test_create_booking(turf_id, available_slot):
        print("❌ Create booking failed")

    # Test 10: Get user bookings
    if not tester.test_get_my_bookings():
        print("❌ Get my bookings failed")

    # Test 11: Cancel booking
    if not tester.test_cancel_booking():
        print("❌ Cancel booking failed")

    # Test 12: Logout
    if not tester.test_logout():
        print("❌ Logout failed")

    # Test 13: Admin login
    if not tester.test_admin_login():
        print("❌ Admin login failed")

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())