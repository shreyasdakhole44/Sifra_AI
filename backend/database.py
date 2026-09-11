import uuid
import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from backend.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class InMemoryDatabase:
    """In-memory datastore fallback if MongoDB is not connected or URI is empty."""
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.reports: Dict[str, Dict[str, Any]] = {}
        self.training_history: Dict[str, Dict[str, Any]] = {}
        self.alerts: Dict[str, Dict[str, Any]] = {}
        self.warnings: Dict[str, Dict[str, Any]] = {}
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.training_assignments: Dict[str, Dict[str, Any]] = {}
        self.worker_locations: List[Dict[str, Any]] = []
        
        # Seed initial default admin/HSC officer and worker users for testing
        self.seed_defaults()

    def seed_defaults(self):
        admin_id = "OIL-HSE-001"
        worker_id_1 = "OIL-W-101"
        worker_id_2 = "OIL-W-102"
        
        self.users[admin_id] = {
            "_id": admin_id,
            "id": admin_id,
            "worker_id": admin_id,
            "name": "HSC Lead Officer (Deepak Gogoi)",
            "email": "admin@oilindia.in",
            "hashed_password": pwd_context.hash("admin123"),
            "role": "HSC Officer",
            "status": "Active",
            "site_id": "OIL-DULIAJAN-01",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.users[worker_id_1] = {
            "_id": worker_id_1,
            "id": worker_id_1,
            "worker_id": worker_id_1,
            "name": "Ramesh Kumar (Worker)",
            "email": "worker@oilindia.in",
            "hashed_password": pwd_context.hash("worker123"),
            "role": "Worker",
            "status": "Active",
            "site_id": "OIL-DIGBOI-01",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.users[worker_id_2] = {
            "_id": worker_id_2,
            "id": worker_id_2,
            "worker_id": worker_id_2,
            "name": "Biren Saikia (Field Tech)",
            "email": "biren@oilindia.in",
            "hashed_password": pwd_context.hash("worker123"),
            "role": "Worker",
            "status": "Active",
            "site_id": "OIL-DULIAJAN-01",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Seed sample warnings
        w_id = str(uuid.uuid4())
        self.warnings[w_id] = {
            "_id": w_id,
            "id": w_id,
            "worker_id": worker_id_1,
            "issued_by": "HSC Lead Officer",
            "message": "Mandatory PPE Warning: Helmet chin strap unfastened near Drill Rig #3.",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "status": "Delivered"
        }

        # Seed sample tasks
        t_id = str(uuid.uuid4())
        self.tasks[t_id] = {
            "_id": t_id,
            "id": t_id,
            "worker_id": worker_id_1,
            "title": "Inspect Pressure Relief Valve on Rig #4",
            "description": "Perform physical audit of line valve V-204 and log gauge reading.",
            "assigned_by": "HSC Lead Officer",
            "status": "Pending",
            "due_date": "2026-09-15"
        }

        # Seed initial worker locations for heatmap
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.worker_locations = [
            {"worker_id": "OIL-W-101", "lat": 27.3520, "lng": 95.3210, "timestamp": now, "zone": "Duliajan Rig #4", "risk_score": 78.5},
            {"worker_id": "OIL-W-102", "lat": 27.3535, "lng": 95.3225, "timestamp": now, "zone": "Duliajan Rig #4", "risk_score": 62.0},
            {"worker_id": "OIL-W-103", "lat": 27.3510, "lng": 95.3195, "timestamp": now, "zone": "Duliajan Station A", "risk_score": 15.0},
            {"worker_id": "OIL-W-104", "lat": 27.3890, "lng": 95.6310, "timestamp": now, "zone": "Digboi Refinery #1", "risk_score": 84.0},
            {"worker_id": "OIL-W-105", "lat": 27.3880, "lng": 95.6300, "timestamp": now, "zone": "Digboi Refinery #1", "risk_score": 45.0},
            {"worker_id": "OIL-W-106", "lat": 27.1820, "lng": 94.9010, "timestamp": now, "zone": "Moran Oil Field B", "risk_score": 20.0},
        ]

db_client: Optional[AsyncIOMotorClient] = None
mongodb = None
in_memory_db = InMemoryDatabase()

async def init_db():
    global db_client, mongodb
    if settings.MONGODB_URI:
        try:
            db_client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
            mongodb = db_client.get_default_database()
            await db_client.admin.command('ping')
            print("Connected to MongoDB successfully!")
        except Exception as e:
            print(f"MongoDB connection warning: {e}. Falling back to in-memory store.")
            mongodb = None
    else:
        print("MONGODB_URI not set. Using in-memory database store.")

def is_mongo_available():
    return mongodb is not None

# Helper CRUD functions abstraction
async def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    if is_mongo_available():
        user = await mongodb.users.find_one({"email": email.lower().strip()})
        if user:
            user["id"] = str(user.get("_id", user.get("id")))
        return user
    else:
        for u in in_memory_db.users.values():
            if u["email"].lower().strip() == email.lower().strip():
                return u
        return None

async def find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if is_mongo_available():
        user = await mongodb.users.find_one({"_id": user_id})
        if user:
            user["id"] = str(user.get("_id"))
        return user
    else:
        return in_memory_db.users.get(user_id)

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    user_id = user_data.get("worker_id") or f"OIL-W-{len(in_memory_db.users) + 100}"
    user_data["_id"] = user_id
    user_data["id"] = user_id
    user_data["worker_id"] = user_id
    user_data["email"] = user_data["email"].lower().strip()
    user_data["status"] = user_data.get("status", "Active")
    user_data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.users.insert_one(user_data)
    else:
        in_memory_db.users[user_id] = user_data
    return user_data

async def create_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
    report_id = str(uuid.uuid4())
    report_data["_id"] = report_id
    report_data["id"] = report_id
    report_data["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.reports.insert_one(report_data)
    else:
        in_memory_db.reports[report_id] = report_data
    return report_data

async def get_reports(filter_query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    filter_query = filter_query or {}
    if is_mongo_available():
        cursor = mongodb.reports.find(filter_query).sort("timestamp", -1)
        reports = []
        async for r in cursor:
            r["id"] = str(r.get("_id"))
            reports.append(r)
        return reports
    else:
        results = list(in_memory_db.reports.values())
        if "worker_id" in filter_query:
            results = [r for r in results if r.get("worker_id") == filter_query["worker_id"]]
        if "site_id" in filter_query:
            results = [r for r in results if r.get("site_id") == filter_query["site_id"]]
        results.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return results

async def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    if is_mongo_available():
        r = await mongodb.reports.find_one({"_id": report_id})
        if r:
            r["id"] = str(r["_id"])
        return r
    else:
        return in_memory_db.reports.get(report_id)

async def update_report_status(report_id: str, status: str) -> Optional[Dict[str, Any]]:
    if is_mongo_available():
        await mongodb.reports.update_one({"_id": report_id}, {"$set": {"status": status}})
        return await get_report_by_id(report_id)
    else:
        if report_id in in_memory_db.reports:
            in_memory_db.reports[report_id]["status"] = status
            return in_memory_db.reports[report_id]
        return None

async def create_training_record(record: Dict[str, Any]) -> Dict[str, Any]:
    rec_id = str(uuid.uuid4())
    record["_id"] = rec_id
    record["id"] = rec_id
    record["completed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.training_history.insert_one(record)
    else:
        in_memory_db.training_history[rec_id] = record
    return record

async def get_user_training_history(worker_id: str) -> List[Dict[str, Any]]:
    if is_mongo_available():
        cursor = mongodb.training_history.find({"worker_id": worker_id}).sort("completed_at", -1)
        history = []
        async for h in cursor:
            h["id"] = str(h["_id"])
            history.append(h)
        return history
    else:
        res = [h for h in in_memory_db.training_history.values() if h.get("worker_id") == worker_id]
        res.sort(key=lambda x: x.get("completed_at", ""), reverse=True)
        return res

async def create_alert(alert_data: Dict[str, Any]) -> Dict[str, Any]:
    alert_id = str(uuid.uuid4())
    alert_data["_id"] = alert_id
    alert_data["id"] = alert_id
    alert_data["sent_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.alerts.insert_one(alert_data)
    else:
        in_memory_db.alerts[alert_id] = alert_data
    return alert_data

async def get_alerts(filter_query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    filter_query = filter_query or {}
    if is_mongo_available():
        cursor = mongodb.alerts.find(filter_query).sort("sent_at", -1)
        alerts = []
        async for a in cursor:
            a["id"] = str(a["_id"])
            alerts.append(a)
        return alerts
    else:
        res = list(in_memory_db.alerts.values())
        if "worker_id" in filter_query:
            res = [a for a in res if a.get("worker_id") == filter_query["worker_id"]]
        res.sort(key=lambda x: x.get("sent_at", ""), reverse=True)
        return res

# --- NEW DATASTORE FUNCTIONS FOR MASTER SPECIFICATION ---

async def create_warning(warning_data: Dict[str, Any]) -> Dict[str, Any]:
    w_id = str(uuid.uuid4())
    warning_data["_id"] = w_id
    warning_data["id"] = w_id
    warning_data["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    warning_data["status"] = warning_data.get("status", "Delivered")
    
    if is_mongo_available():
        await mongodb.warnings.insert_one(warning_data)
    else:
        in_memory_db.warnings[w_id] = warning_data
    return warning_data

async def get_warnings(filter_query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    filter_query = filter_query or {}
    if is_mongo_available():
        cursor = mongodb.warnings.find(filter_query).sort("timestamp", -1)
        res = []
        async for w in cursor:
            w["id"] = str(w["_id"])
            res.append(w)
        return res
    else:
        res = list(in_memory_db.warnings.values())
        if "worker_id" in filter_query:
            res = [w for w in res if w.get("worker_id") == filter_query["worker_id"]]
        res.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return res

async def create_task(task_data: Dict[str, Any]) -> Dict[str, Any]:
    t_id = str(uuid.uuid4())
    task_data["_id"] = t_id
    task_data["id"] = t_id
    task_data["status"] = task_data.get("status", "Pending")
    task_data["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.tasks.insert_one(task_data)
    else:
        in_memory_db.tasks[t_id] = task_data
    return task_data

async def get_tasks(filter_query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    filter_query = filter_query or {}
    if is_mongo_available():
        cursor = mongodb.tasks.find(filter_query)
        res = []
        async for t in cursor:
            t["id"] = str(t["_id"])
            res.append(t)
        return res
    else:
        res = list(in_memory_db.tasks.values())
        if "worker_id" in filter_query:
            res = [t for t in res if t.get("worker_id") == filter_query["worker_id"]]
        return res

async def update_task_status(task_id: str, status_str: str) -> Optional[Dict[str, Any]]:
    if is_mongo_available():
        await mongodb.tasks.update_one({"_id": task_id}, {"$set": {"status": status_str}})
        t = await mongodb.tasks.find_one({"_id": task_id})
        if t:
            t["id"] = str(t["_id"])
        return t
    else:
        if task_id in in_memory_db.tasks:
            in_memory_db.tasks[task_id]["status"] = status_str
            return in_memory_db.tasks[task_id]
        return None

async def create_training_assignment(assignment: Dict[str, Any]) -> Dict[str, Any]:
    a_id = str(uuid.uuid4())
    assignment["_id"] = a_id
    assignment["id"] = a_id
    assignment["status"] = "assigned"
    assignment["assigned_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    if is_mongo_available():
        await mongodb.training_assignments.insert_one(assignment)
    else:
        in_memory_db.training_assignments[a_id] = assignment
    return assignment

async def get_training_assignments(worker_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if is_mongo_available():
        query = {"worker_id": worker_id} if worker_id else {}
        cursor = mongodb.training_assignments.find(query)
        res = []
        async for a in cursor:
            a["id"] = str(a["_id"])
            res.append(a)
        return res
    else:
        res = list(in_memory_db.training_assignments.values())
        if worker_id:
            res = [a for a in res if a.get("worker_id") == worker_id]
        return res

async def get_all_users() -> List[Dict[str, Any]]:
    if is_mongo_available():
        cursor = mongodb.users.find({})
        users = []
        async for u in cursor:
            u["id"] = str(u["_id"])
            u.pop("hashed_password", None)
            users.append(u)
        return users
    else:
        users = []
        for u in in_memory_db.users.values():
            copy_u = dict(u)
            copy_u.pop("hashed_password", None)
            users.append(copy_u)
        return users

async def get_worker_details(worker_id: str) -> Optional[Dict[str, Any]]:
    user = await find_user_by_id(worker_id)
    if not user:
        return None
    
    # Aggregate worker metrics
    reports = await get_reports({"worker_id": worker_id})
    trainings = await get_user_training_history(worker_id)
    warns = await get_warnings({"worker_id": worker_id})
    tsks = await get_tasks({"worker_id": worker_id})

    avg_prob = sum(r.get("ml_probability", 0) for r in reports) / len(reports) if reports else 0.0
    training_avg = sum(t.get("percentage", 0) for t in trainings) / len(trainings) if trainings else 0.0

    return {
        "worker_id": user.get("worker_id", user["id"]),
        "name": user.get("name", "Worker"),
        "email": user.get("email"),
        "role": user.get("role", "Worker"),
        "site_id": user.get("site_id", "OIL-DULIAJAN"),
        "status": user.get("status", "Active"),
        "total_incidents": len(reports),
        "last_report": reports[0] if reports else None,
        "avg_risk_probability": round(avg_prob, 1),
        "training_completion_pct": round(training_avg, 1),
        "open_warnings_count": len(warns),
        "warnings": warns,
        "tasks": tsks
    }

async def get_worker_locations() -> List[Dict[str, Any]]:
    if is_mongo_available():
        cursor = mongodb.worker_locations.find({})
        locs = []
        async for l in cursor:
            l["id"] = str(l.get("_id", uuid.uuid4()))
            locs.append(l)
        return locs
    else:
        return in_memory_db.worker_locations
