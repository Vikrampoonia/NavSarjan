import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerFreeAccount } from "../../services/backendApi";
import { MESSAGES } from "../../constants/messages";
import { setAuthSession } from "../../utils/authSession";
import { setUserdata } from "./Signpage";

function CreateAccount() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: "",
        address: "",
        role: "startup",
    });

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await registerFreeAccount({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                phone: formData.phone,
                dob: formData.dob,
                role: formData.role,
            });

            if (!response?.success) {
                alert(response?.message || MESSAGES.COMMON.SUBMIT_FAILED);
                return;
            }

            const createdUser = {
                email: response.user?.email,
                id: response.user?.id,
                name: response.user?.name,
                role: response.user?.role,
            };

            setUserdata(createdUser);
            setAuthSession({
                token: response.token,
                refreshToken: response.refreshToken,
                user: createdUser,
            });

            alert(response.message || MESSAGES.AUTH.FREE_ACCOUNT_CREATED);
            navigate("/dashboard");
        } catch (error) {
            console.error("Error during account creation:", error);
            alert(error?.response?.data?.message || MESSAGES.COMMON.SUBMIT_FAILED);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative flex items-end px-4 pb-10 pt-60 sm:pb-16 md:justify-center lg:pb-24 bg-gray-50 sm:px-6 lg:px-8">
                    <div className="absolute inset-0">
                        <img
                            className="object-cover object-top w-full h-full"
                            src="https://cdn.rareblocks.xyz/collection/celebration/images/signin/4/girl-thinking.jpg"
                            alt="Create account"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>

                    <div className="relative">
                        <div className="w-full max-w-xl xl:w-full xl:mx-auto xl:pr-24 xl:max-w-xl">
                            <h3 className="text-4xl font-bold text-white">Join 2k+ Mentors and build your startup</h3>
                            <p className="mt-4 text-lg text-gray-200">Create your free account and start using NavSarjan.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center px-4 py-10 bg-white sm:px-6 lg:px-8 sm:py-16 lg:py-24">
                    <div className="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
                        <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">Create an Account</h2>
                        <p className="mt-2 text-base text-gray-600">
                            Already have an account? <Link to="/sign-page" className="text-blue-600 hover:underline">Log in</Link>
                        </p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onInputChange}
                                placeholder="Enter your name"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onInputChange}
                                placeholder="Enter your email"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={onInputChange}
                                placeholder="Enter your phone"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={onInputChange}
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={onInputChange}
                                placeholder="Enter your address"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <select
                                name="role"
                                value={formData.role}
                                onChange={onInputChange}
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            >
                                <option value="startup">Startup</option>
                                <option value="investor">Investor</option>
                                <option value="policy-maker">Policy Maker</option>
                            </select>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={onInputChange}
                                placeholder="Enter your password"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={onInputChange}
                                placeholder="Confirm your password"
                                className="block w-full p-4 text-black border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                                required
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white border border-transparent rounded-md bg-gradient-to-r from-fuchsia-600 to-blue-600 ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"}`}
                            >
                                {isSubmitting ? "Creating account..." : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CreateAccount;
