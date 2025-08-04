const Attendance = require('../models/Attendance');
const User = require('../models/User');

// ----------- UTILITIES ---------------
const calculateHours = (from, to) => {
  const [fH, fM] = from.split(':').map(Number);
  const [tH, tM] = to.split(':').map(Number);
  return ((tH * 60 + tM) - (fH * 60 + fM)) / 60;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

const formatTime12hr = (time24) => {
  const [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const mapTimeArrayTo12hr = (array) => {
  return array.map(({ from, to }) => ({
    from: formatTime12hr(from),
    to: formatTime12hr(to)
  }));
};

// ----------- CONTROLLERS -------------

exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const results = [];

    for (const record of records) {
      const { userId, date, status, permissionHours = [], extraHours = [] } = record;
      const currentDate = normalizeDate(date);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      let attendance = await Attendance.findOne({ userId, year, month });

      const calc = (arr) => arr.reduce((sum, { from, to }) => sum + calculateHours(from, to), 0);
      const totalHours = Math.max(0, (status === 'Present' ? 8 : 0) - calc(permissionHours) + calc(extraHours));

      const dayEntry = { date: currentDate, status, permissionHours, extraHours, totalHours };

      if (!attendance) {
        attendance = new Attendance({ userId, year, month, days: [dayEntry] });
      } else {
        const i = attendance.days.findIndex(d =>
          normalizeDate(d.date).getTime() === currentDate.getTime()
        );
        if (i >= 0) attendance.days[i] = dayEntry;
        else attendance.days.push(dayEntry);
      }

      await attendance.save();
      results.push({ userId, status: 'updated' });
    }

    res.status(200).json({ message: 'Bulk attendance updated', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSingleAttendance = async (req, res) => {
  try {
    const { userId, date, status, permissionHours = [], extraHours = [] } = req.body;
    const currentDate = normalizeDate(date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let attendance = await Attendance.findOne({ userId, year, month });

    const calc = (arr) => arr.reduce((sum, { from, to }) => sum + calculateHours(from, to), 0);
    const totalHours = Math.max(0, (status === 'Present' ? 8 : 0) - calc(permissionHours) + calc(extraHours));

    const dayEntry = { date: currentDate, status, permissionHours, extraHours, totalHours };

    if (!attendance) {
      attendance = new Attendance({ userId, year, month, days: [dayEntry] });
    } else {
      const i = attendance.days.findIndex(d =>
        normalizeDate(d.date).getTime() === currentDate.getTime()
      );
      if (i >= 0) attendance.days[i] = dayEntry;
      else attendance.days.push(dayEntry);
    }

    await attendance.save();
    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = normalizeDate(date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const users = await User.find({}, 'name employeeId officialMailId formId role designation');
    const result = [];

    for (const user of users) {
      const attendance = await Attendance.findOne({ userId: user._id, year, month });

      const dayData = attendance?.days.find(
        d => normalizeDate(d.date).getTime() === targetDate.getTime()
      );

      result.push({
        user,
        date: formatDate(targetDate),
        status: dayData?.status || 'Absent',
        totalHours: dayData?.totalHours || 0,
        permissionHours: mapTimeArrayTo12hr(dayData?.permissionHours || []),
        extraHours: mapTimeArrayTo12hr(dayData?.extraHours || [])
      });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId } = req.query;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month); // 0-indexed

    const record = await Attendance.findOne({ userId, year, month });
    if (!record) return res.json({ daysPresent: 0, totalHours: 0 });

    const daysPresent = record.days.filter(d => d.status === 'Present').length;
    const totalHours = record.days.reduce((sum, d) => sum + d.totalHours, 0);
    res.json({ daysPresent, totalHours });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlySummaryDetailed = async (req, res) => {
  try {
    const { year, month } = req.query;
    const users = await User.find({}, 'name employeeId formId designation');
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);
    const result = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = normalizeDate(d);
      const attendanceList = await Attendance.find({ year, month });

      const daySummary = {
        date: formatDate(date),
        present: [],
        absent: [],
        permission: [],
        extraWork: []
      };

      for (const user of users) {
        const userAttendance = attendanceList.find(a => String(a.userId) === String(user._id));
        const dayData = userAttendance?.days.find(dd => normalizeDate(dd.date).getTime() === date.getTime());

        if (!dayData || dayData.status === 'Absent') daySummary.absent.push(user);
        else daySummary.present.push(user);

        if (dayData?.permissionHours?.length > 0) {
          daySummary.permission.push({ user, permissionHours: mapTimeArrayTo12hr(dayData.permissionHours) });
        }

        if (dayData?.extraHours?.length > 0) {
          daySummary.extraWork.push({ user, extraHours: mapTimeArrayTo12hr(dayData.extraHours) });
        }
      }

      result.push({
        date: daySummary.date,
        presentCount: daySummary.present.length,
        absentCount: daySummary.absent.length,
        presentList: daySummary.present,
        absentList: daySummary.absent,
        permissionList: daySummary.permission,
        extraWorkingList: daySummary.extraWork
      });
    }

    res.status(200).json({ month: `${parseInt(month) + 1}-${year}`, summary: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyDailyHistory = async (req, res) => {
  try {
    const { year, month } = req.query;
    const users = await User.find({}, 'name employeeId formId designation');
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);
    const allAttendance = await Attendance.find({ year, month });
    const summary = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = normalizeDate(d);
      const daily = {
        date: formatDate(date),
        presentList: [],
        absentList: [],
        permissionList: [],
        extraWorkingList: []
      };

      for (const user of users) {
        const record = allAttendance.find(a => String(a.userId) === String(user._id));
        const dayData = record?.days.find(entry => normalizeDate(entry.date).getTime() === date.getTime());

        if (!dayData || dayData.status === 'Absent') daily.absentList.push(user);
        else daily.presentList.push(user);

        if (dayData?.permissionHours?.length > 0) {
          daily.permissionList.push({ user, permissionHours: mapTimeArrayTo12hr(dayData.permissionHours) });
        }

        if (dayData?.extraHours?.length > 0) {
          daily.extraWorkingList.push({ user, extraHours: mapTimeArrayTo12hr(dayData.extraHours) });
        }
      }

      summary.push({
        date: daily.date,
        presentCount: daily.presentList.length,
        absentCount: daily.absentList.length,
        presentList: daily.presentList,
        absentList: daily.absentList,
        permissionList: daily.permissionList,
        extraWorkingList: daily.extraWorkingList
      });
    }

    res.status(200).json({ month: `${parseInt(month) + 1}-${year}`, totalDays: summary.length, dailyHistory: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
