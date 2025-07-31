import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { Spinner, Alert } from 'react-bootstrap';

const SalaryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSalaries = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/users`);
      const users = res.data.data;

      const formatted = users.map(user => ({
        name: user.name,
        salary: user.currentSalary || 0,
        increments: user.increments?.length || 0
      }));

      setData(formatted);
    } catch (err) {
      setError('Failed to load salary data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  if (loading) {
    return <Spinner animation="border" variant="primary" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="mt-5">
      <h4 className="mb-3">Salary Overview</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="salary" fill="#007bff" name="Salary">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.increments > 0 ? '#00c49f' : '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-muted mt-2">
        Green bars = employees with increments
      </p>
    </div>
  );
};

export default SalaryChart;
