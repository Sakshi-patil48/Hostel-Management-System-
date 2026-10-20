from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelBlockViewSet, RoomViewSet, BedViewSet,
    StudentViewSet, RoomAllocationViewSet, FeeRecordViewSet,
    PaymentViewSet, AttendanceViewSet, AttendanceSessionViewSet,
    StudentPortalViewSet, ComplaintViewSet,
    NoticeViewSet, EmployeeViewSet, EmployeePaymentViewSet,
    DashboardSummaryView, ExportReportCSVView
)

router = DefaultRouter()
router.register(r'blocks', HostelBlockViewSet, basename='block')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'beds', BedViewSet, basename='bed')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'allocations', RoomAllocationViewSet, basename='allocation')
router.register(r'fees', FeeRecordViewSet, basename='fee')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'attendance-sessions', AttendanceSessionViewSet, basename='attendance-session')
router.register(r'student-portal', StudentPortalViewSet, basename='student-portal')
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'notices', NoticeViewSet, basename='notice')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'employee-payments', EmployeePaymentViewSet, basename='employee-payment')

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('reports/export/<str:report_type>/', ExportReportCSVView.as_view(), name='reports-export-csv'),
    path('attendance/sessions/', AttendanceSessionViewSet.as_view({'get': 'list', 'post': 'create'}), name='attendance-sessions-compat'),
    path('attendance/sessions/active/', AttendanceSessionViewSet.as_view({'get': 'active'}), name='attendance-sessions-active-compat'),
    path('attendance/sessions/<int:pk>/close/', AttendanceSessionViewSet.as_view({'post': 'close'}), name='attendance-sessions-close-compat'),
    path('', include(router.urls)),
]
